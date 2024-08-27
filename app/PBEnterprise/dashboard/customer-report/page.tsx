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
import { API_ENDPOINTS, API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';
import { ArrayProps } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useRouter } from 'next/navigation';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import { validateForm } from '@/utils/FormValidationRules';
import moment from 'moment';
import MultiSelectDropdown from '@/components/MultiSelect';

interface TechnicianReportColumn {
  accessorKey: string;
  header: any;
  className?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

const CustomerReport: React.FC = () => {
  const [searchData, setSearchData] = useState<{ [Key: string]: any }>({
    search: '',
    from: '',
    to: '',
  });
  const [serviceList, setServiceList] = useState<ArrayProps[] | undefined>([]);
  const apiAction = useMutation(apiCall);
  const router = useRouter();
  const [dateRange, setDateRange] = useState<FormData>();
  const [errors, setErrors] = useState<FormData>();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    amc: { id: -1, amc_code: 'All' },
    variant_type: { id: -1, name: 'All' },
    unit_tonnage: { id: -1, name: 'All' },
    brand: { id: -1, name: 'All' },
    model: { id: -1, model_number: 'All' },
  });
  const [listAmc, setAmcList] = useState<Array<FormData>>([]);
  const [variantList, setVariantList] = useState<Array<FormData>>([]);
  const [unitTonnageList, setUnitTonnageList] = useState<Array<FormData>>([]);
  const [brandList, setBrandList] = useState<Array<FormData>>([]);
  const [modelsList, setModelsList] = useState<Array<FormData>>([]);

  useEffect(() => {
    fetchAmcList();
    fetchMachineVariant();
    fetchUnitTonnage();
    fetchBrandList();
  }, []);

  useEffect(() => {
    if (listAmc.length > 0) {
      fetchTechnicianReport();
    }
  }, [formData]);

  useEffect(() => {
    fetchModelsList();
  }, [formData?.brand.id]);

  const onExportClick = async () => {
    setExportLoading(true);
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

        let endpoint: string = `${API_ENDPOINTS_ENTERPRISE.EXPORT_TECHNICIAN_REPORT}?from=${fromDate}&to=${toDate}`;
        const blob: Blob = await downloadFile(endpoint);
        const blobUrl: string = window.URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = blobUrl;
        a.download = `technician-report-${fromDate}-to-${toDate}.xlsx`;

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
      setExportLoading(false);
    }
  };

  const fetchTechnicianReport = async () => {
    try {
      const fromDate = dateRange?.from
        ? moment(dateRange.from).format('Y-MM-DD')
        : null;
      const toDate = dateRange?.to
        ? moment(dateRange.to).format('Y-MM-DD')
        : null;

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
      if (!isError && moment(toDate).isBefore(moment(fromDate))) {
        errors['to'] = ERROR_MESSAGES.fromDateGreater;
        isError = true;
      }
      if (isError) {
        setErrors(errors);
      } else {
        setErrors({});
        let endpoint = `${API_ENDPOINTS_ENTERPRISE.CUSTOMER_REPORT_LIST}`;

        // Define the type for params
        type ParamsType = {
          from: string | null;
          to: string | null;
          list: boolean;
          partner_id?: string;
          filters?: any;
        };

        let params: ParamsType = {
          from: fromDate,
          to: toDate,
          list: true,
          filters: {
            amc: {
              name: formData?.amc?.amc_code,
              amcplan_id: formData?.amc?.id == -1 ? 'all' : formData?.amc?.id,
            },
            varient: {
              name: formData?.variant_type?.name,
              varient_type_id:
                formData?.variant_type?.id == -1
                  ? 'all'
                  : formData?.variant_type?.id,
            },
            unittonnage: {
              name: formData?.unit_tonnage?.name,
              unit_tonnage_id:
                formData?.unit_tonnage?.id == -1
                  ? 'all'
                  : formData?.unit_tonnage?.id,
            },
            brand: {
              name: formData?.brand?.name,
              brand_id: formData?.brand?.id == -1 ? 'all' : formData?.brand?.id,
            },
            model: {
              name: formData?.model?.model_number,
              model_id: formData?.model?.id == -1 ? 'all' : formData?.model?.id,
            },
          },
        };

        const fetchBrand = {
          endpoint: endpoint,
          method: 'POST',
          body: params,
        };
        setLoading(true);
        setServiceList(undefined);
        const { data } = await apiAction.mutateAsync(fetchBrand);
        if (data) {
          const serviceList = [];
          serviceList.push({
            id: 1,
            name: `AMC Type: <b>${formData?.amc?.amc_code}</b>`,
            total: data.totalAmcCustomers,
          });
          serviceList.push({
            id: 2,
            name: `Variant Type: <b>${formData?.variant_type?.name}</b>`,
            total: data.totalVariantTypeCustomers,
          });
          serviceList.push({
            id: 3,
            name: `Unit Tonnage: <b>${formData?.unit_tonnage?.name}</b>`,
            total: data.totalUnitTonnageCustomers,
          });
          serviceList.push({
            id: 4,
            name: `Brand: <b>${formData?.brand?.name}</b>`,
            total: data.totalBrandCustomers,
          });
          serviceList.push({
            id: 5,
            name: `Model: <b>${formData?.model?.model_number}</b>`,
            total: data.totalModelCustomers,
          });

          setServiceList(serviceList);
        }
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmcList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${API_ENDPOINTS_ENTERPRISE?.AMC_PLANS}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) {
        const tempData: any = data;
        tempData.unshift({
          id: -1,
          amc_code: 'All',
        });
        setAmcList(tempData);
      } else setAmcList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchMachineVariant = async () => {
    try {
      const fetchVariant = {
        endpoint: `${API_ENDPOINTS.MACHINEVARIANT}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchVariant);
      if (data) {
        const tempData: any = data;
        tempData.unshift({
          id: -1,
          name: 'All',
        });
        setVariantList(tempData);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchUnitTonnage = async () => {
    try {
      const fetchUnitTonnageRequest = {
        endpoint: `${API_ENDPOINTS.UNITTONNAGE}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchUnitTonnageRequest);
      if (data) {
        const tempData: any = data;
        tempData.unshift({
          id: -1,
          name: 'All',
        });
        setUnitTonnageList(tempData);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchBrandList = async () => {
    try {
      const fetchBrand = {
        endpoint: `${API_ENDPOINTS_ENTERPRISE.BRAND}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBrand);
      if (data) {
        const tempData: any = data;
        tempData.unshift({
          id: -1,
          name: 'All',
        });
        setBrandList(tempData);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchModelsList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${API_ENDPOINTS.MACHINEMODEL}?need_all=1`,
        method: 'GET',
      };

      if (formData?.brand?.id > -1) {
        fetchRequest.endpoint += `&brand_id=${formData?.brand?.id}`;
      }

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) {
        const tempData: any = data;
        tempData.unshift({
          id: -1,
          model_number: 'All',
        });
        setModelsList(tempData);
      } else setModelsList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onSearchClcik = () => {
    fetchTechnicianReport();
  };

  const handleDropDownChange = (key: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
      ...(key === 'brand' && { model: { id: -1, model_number: 'All' } }),
    }));
  };

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

  const columns: TechnicianReportColumn[] = [
    { accessorKey: 'id', header: 'Sr No.' },
    {
      accessorKey: 'name',
      header: 'Multiple Sorts',
      render: (item: any) => (
        <div dangerouslySetInnerHTML={{ __html: item.name }} />
      ),
    },
    { accessorKey: 'total', header: 'No of Customers' },
  ];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className={`items-top grid w-full grid-cols-3 gap-5`}>
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
              icon={<IconSearch />}
              disabled={loading}
            >
              Search
            </Button>
            <div>
              {(serviceList || [])?.length > 0 && (
                <Button
                  className='min-w-14'
                  onClick={() => onExportClick()}
                  disabled={exportLoading}
                  variant={'secondary'}
                >
                  {exportLoading ? (
                    <IconLoading className='h-5 w-5' />
                  ) : (
                    <IconDownload className='h-5 w-5' />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className='grid grid-cols-5 gap-5'>
          <div>
            <MultiSelectDropdown
              isMulti={false} // or false for single-select
              options={listAmc}
              closeMenuOnSelect={true}
              label='AMC Plans'
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.amc_code} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                handleDropDownChange('amc', selectedValues)
              }
              value={formData?.amc}
            />
          </div>
          <div>
            <MultiSelectDropdown
              isMulti={false} // or false for single-select
              options={variantList}
              closeMenuOnSelect={true}
              label='Variant Type'
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                handleDropDownChange('variant_type', selectedValues)
              }
              value={formData?.variant_type}
            />
          </div>
          <div>
            <MultiSelectDropdown
              isMulti={false} // or false for single-select
              options={unitTonnageList}
              closeMenuOnSelect={true}
              label='Unit Tonnage'
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                handleDropDownChange('unit_tonnage', selectedValues)
              }
              value={formData?.unit_tonnage}
            />
          </div>
          <div>
            <MultiSelectDropdown
              isMulti={false} // or false for single-select
              options={brandList}
              closeMenuOnSelect={true}
              label='Brands'
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                handleDropDownChange('brand', selectedValues)
              }
              value={formData?.brand}
            />
          </div>
          <div>
            <MultiSelectDropdown
              isMulti={false} // or false for single-select
              options={modelsList}
              closeMenuOnSelect={true}
              label='Models'
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.model_number} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                handleDropDownChange('model', selectedValues)
              }
              value={formData?.model}
            />
          </div>
        </div>
        <div className=' fle>x h-full flex-col'>
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

export default CustomerReport;
