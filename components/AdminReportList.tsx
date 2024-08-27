'use client';
import Breadcrumb from '@/components/Breadcrumb';
import DatepickerComponent from '@/components/DatePicker';
import TableComponent from '@/components/Table';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { apiCall, downloadFile } from '@/hooks/api';
import {
  IconBxErrorCircle,
  IconDownload,
  IconLoading,
  IconSearch,
} from '@/utils/Icons';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import ROUTES, { ArrayProps, getBaseUrl, isPBPartnerUser } from '@/utils/utils';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { DataContext } from '@/context/dataProvider';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/SelectBox';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import { validateForm } from '@/utils/FormValidationRules';
import moment from 'moment';

interface AdminReportListProps {
  apiBaseUrl: any;
  isAdmin?: boolean;
}

interface TechnicianReportColumn {
  accessorKey: string;
  header: any;
  className?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

const AdminReportList: React.FC<AdminReportListProps> = ({
  apiBaseUrl,
  isAdmin,
}) => {
  const [searchData, setSearchData] = useState<{ [Key: string]: any }>({
    search: '',
    from: '',
    to: '',
  });
  const { state } = useContext(DataContext);
  const [serviceList, setServiceList] = useState<ArrayProps[] | undefined>([]);
  const apiAction = useMutation(apiCall);
  const [dateRange, setDateRange] = useState<FormData>();
  const [errors, setErrors] = useState<FormData>();
  const [loading, setLoading] = useState(false);
  const [isLoadingList, setLoadingList] = useState(false);
  const [partnerList, setPartnerList] = useState([]);
  const [selectedPartner, setselectedPartner] = useState<FormData>({
    id: -1,
  });
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);

  useEffect(() => {
    if (isAdmin) {
      fetchPartners();
    }
  }, []);

  const fetchPartners = async () => {
    try {
      const apiData = {
        endpoint: `${apiBaseUrl.PARTNER}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      if (data) {
        const partnerData: any = data;
        partnerData.unshift({ id: -1, name: 'All' });
        setPartnerList(partnerData);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
    }
  };

  const onExportClick = async () => {
    setLoading(true);
    try {
      const validationRules = [
        {
          field: 'from',
          value: dateRange?.from,
          customMessage: 'Please select From Date',
        },
        {
          field: 'to',
          value: dateRange?.to,
          customMessage: 'Please select To Date',
        },
      ];

      let { isError, errors } = validateForm(validationRules);
      if (!isError && moment(dateRange?.to).isBefore(moment(dateRange?.from))) {
        errors['to'] = ERROR_MESSAGES.fromDateGreater;
        isError = true;
      }

      if (isError) {
        setErrors(errors);
      } else {
        setErrors({});
        const fromDate = moment(dateRange?.from).format('Y-MM-DD');
        const toDate = moment(dateRange?.to).format('Y-MM-DD');
        const partnerId = selectedPartner?.partner_id;

        let endpoint: string = `${apiBaseUrl.EXPORT_ADMIN_REPORT}?from=${fromDate}&to=${toDate}`;

        if (partnerId > -1) {
          endpoint += `&partner_id=${partnerId}`;
        }

        const blob: Blob = await downloadFile(endpoint);

        const blobUrl: string = window.URL.createObjectURL(blob);

        const a: HTMLAnchorElement = document.createElement('a');
        a.href = blobUrl;
        a.download = `admin-report.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      // setDateRange({ from: null, to: null });
      setLoading(false);
    }
  };

  const fetchTechnicianReport = async () => {
    try {
      setLoadingList(true);
      const fromDate = dateRange?.from
        ? moment(dateRange.from).format('Y-MM-DD')
        : null;
      const toDate = dateRange?.to
        ? moment(dateRange.to).format('Y-MM-DD')
        : null;
      const partnerId = selectedPartner?.partner_id;

      const validationRules: any = [];
      if (!isAdmin) {
        validationRules.push({
          field: 'from',
          value: dateRange?.from,
          customMessage: 'Please select From Date',
        });
        validationRules.push({
          field: 'to',
          value: dateRange?.to,
          customMessage: 'Please select To Date',
        });
      }

      let { isError, errors } = validateForm(validationRules);
      if (!isError && moment(toDate).isBefore(moment(fromDate))) {
        errors['to'] = ERROR_MESSAGES.fromDateGreater;
        isError = true;
      }

      if (isError) {
        setErrors(errors);
      } else {
        setErrors({});
        let endpoint = `${apiBaseUrl.ADMIN_REPORT_LIST}`;

        // Define the type for params
        type ParamsType = {
          from?: string | null;
          to?: string | null;
          list: boolean;
          partner_id?: string;
        };

        let params: ParamsType = {
          list: true,
        };

        if (fromDate) {
          params.from = fromDate;
        }

        if (toDate) {
          params.to = toDate;
        }

        if (partnerId && partnerId > -1) {
          params.partner_id = partnerId;
        }

        const fetchBrand = {
          endpoint: endpoint,
          method: 'POST',
          body: params,
        };

        setServiceList(undefined);
        const { data } = await apiAction.mutateAsync(fetchBrand);
        if (data) setServiceList(data);
        else setServiceList([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setServiceList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const onSearchClcik = () => {
    fetchTechnicianReport();
  };

  const columns: TechnicianReportColumn[] = [
    {
      accessorKey: 'sr_no',
      header: 'Sr No.',
      render: (item: any, index: number) => <span>{index + 1}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      // render: (item: any) => {
      //   return
      //   isAdmin ? (
      //     <Link
      //       href={`/${basePath}/dashboard/customers/${item?.customer_id}`}
      //       className='font-bold text-blueButton-default'
      //     >
      //       {item?.name || ''}
      //     </Link>
      //   ) :
      //   (
      //     <span>{item?.name || ''}</span>
      //   );
      // },
    },
    { accessorKey: 'count', header: 'Total Complaints Logged' },
  ];

  const handleDateRangeChange = (field: string, value: any) => {
    setDateRange((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    if (isRequired(value)) {
      setErrors((prevError) => {
        return {
          ...prevError,
          [field]: '',
        };
      });
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setselectedPartner((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div
          className={`items-top grid w-full ${
            isAdmin ? 'grid-cols-4' : 'grid-cols-3'
          }  gap-5`}
        >
          {isAdmin && (
            <>
              <SelectBox
                options={partnerList}
                // value={selectedPartner}
                onChange={(e) => handleInputChange('partner_id', e)}
                error={errors?.customer_id || ''}
              />{' '}
            </>
          )}
          <>
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              onChange={(e) => handleDateRangeChange('from', e)}
              selectedDate={dateRange?.from}
              error={errors?.from || ''}
              placeholderText='From'
            />
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              onChange={(e) => handleDateRangeChange('to', e)}
              selectedDate={dateRange?.to}
              error={errors?.to || ''}
              placeholderText='To'
            />
          </>
          <div className='grid grid-cols-2 gap-5'>
            <Button
              variant={'blue'}
              className='!w-full'
              onClick={onSearchClcik}
              disabled={isLoadingList}
              icon={<IconSearch />}
            >
              Search
            </Button>
            <div>
              {(serviceList || []).length > 0 && (
                <Button
                  onClick={() => onExportClick()}
                  variant={'secondary'}
                  className='min-w-14'
                  disabled={loading}
                >
                  {loading ? (
                    <IconLoading className='h-5 w-5' />
                  ) : (
                    <IconDownload className='h-5 w-5' />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className=' flex h-full flex-col overflow-auto'>
          <TableComponent
            columns={columns}
            data={serviceList}
            searchTerm={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminReportList;
