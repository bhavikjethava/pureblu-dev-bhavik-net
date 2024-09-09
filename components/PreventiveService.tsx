'use client';
import Breadcrumb from '@/components/Breadcrumb';
import CheckboxItem from '@/components/CheckboxItem';
import AmcInfoDialog from '@/components/Customers/AmcInfoDialog';
import DatepickerComponent from '@/components/DatePicker';
import InputField from '@/components/InputField';
import TableComponent from '@/components/Table';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { apiCall, downloadFile } from '@/hooks/api';
import { IconBxErrorCircle, IconLoading, IconSearch } from '@/utils/Icons';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import ROUTES, {
  ArrayProps,
  CUSTOMER,
  HELPERSDATA,
  OptionType,
  REFRESHCOMPLAINTLIST,
  SKILLLIST,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import { Search } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { DataContext } from '@/context/dataProvider';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import MyDialog from '@/components/MyDialog';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/SelectBox';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import Radio from '@/components/Radio';
import { validateForm } from '@/utils/FormValidationRules';
import moment from 'moment';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import AssignTechniciansDialog from '@/components/AssignTechniciansDialog';

interface PreventiveServiceColumn {
  accessorKey: string;
  header: any;
  className?: string;
  [key: string]: any;
}

interface TechnicianColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface FormData {
  [key: string]: any;
}

const PERPAGE = 50;
const PreventiveService = ({ apiBaseUrl }: any) => {
  const [searchData, setSearchData] = useState<{ [Key: string]: any }>({
    search: '',
    from: null,
    to: null,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { state } = useContext(DataContext);
  const [helperData, setHelperData] = useState();

  const [isViewAll, setViewAll] = useState(false);
  const [serviceList, setServiceList] = useState<Array<ArrayProps> | undefined>(
    []
  );
  const apiAction = useMutation(apiCall);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openAMCInfoModal, setOpenAMCinfoModal] = useState(false);
  const router = useRouter();
  const { id } = useParams();
  const [assignDialog, setAssignDialog] = useState(false);
  const [clearPastDialog, setClearPastDialog] = useState(false);
  const [showExportDialog, setExportDialog] = useState(false);
  const [selectedComplaint, setselectedComplaint] = useState<FormData>();
  const [selectedSkill, setSelectedSkill] = useState(-1);
  const [skillList, setSkillList] = useState<Array<OptionType>>([]);
  const [selectedTechnician, setselectedTechnician] = useState<FormData>();
  const [errors, setErrors] = useState<FormData>();
  // const [technicianList, setTechnicianList] = useState<FormData | undefined>();
  const [loading, setLoading] = useState(false);
  const [isSelectAllService, setSelectAllServices] = useState(false);
  const [selectedServiceIds, setSelecteedServiceIds] = useState<FormData[]>([]);
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);
  // const [selectedServiceIds, setSelecteedServiceIds] = useState<string[]>(
  //   []
  // );
  const [dateRange, setDateRange] = useState<FormData>();
  const [isPreventiveServiceLoading, setPreventiveServiceLoading] =
    useState(false);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;
  const [filteredTechnicianData, setfilteredTechnicianData] =
    useState<FormData>();
  const { technicianList, updateTechnicianList } =
    useFetchTechnician(apiBaseUrl);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      setHelperData((pre: any) => {
        return {
          ...pre,
          data: state?.[HELPERSDATA],
        };
      });
    }
  }, [state?.[HELPERSDATA]]);

  // useEffect(() => {
  //   isViewAll && fetchPreventiveService();
  // }, [isViewAll]);

  useEffect(() => {
    if (page > 0) fetchPreventiveService();
  }, [page]);

  const refetchPreventiveService = () => {
    if (page == 1) {
      fetchPreventiveService();
    } else {
      setPage(1);
    }
  };

  const fetchPreventiveService = async () => {
    const fromDate = searchData?.from
      ? moment(searchData.from).format('Y-MM-DD')
      : null;
    const toDate = searchData?.to
      ? moment(searchData.to).format('Y-MM-DD')
      : null;

    let endpoint = `${apiBaseUrl.PREVENTIVE_SERVICES}?search=${
      searchData?.search || ''
    }`;

    // if (isViewAll) {
    //   endpoint += `&need_all=1`;
    // } else {
    endpoint += `&page=${page}&per_page=${PERPAGE}`;
    // }

    if (!isViewAll) {
      endpoint += `&search_in_branch=${searchData?.searchInBranch ? 1 : 2}`;
    }

    if (fromDate) {
      endpoint += `&from=${fromDate}`;
    }

    if (toDate) {
      endpoint += `&to=${toDate}`;
    }

    try {
      const fetchBrand = {
        endpoint: endpoint,
        method: 'GET',
      };

      setServiceList(undefined);
      setPreventiveServiceLoading(true);
      const { data } = await apiAction.mutateAsync(fetchBrand);
      if (data) {
        // if (isViewAll) {
        //   setServiceList(data);
        // } else {
          setServiceList(data?.data);
          setTotal(data?.total);
        // }
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setPreventiveServiceLoading(false);
    }
  };

  const clearPastHistory = async () => {
    setLoading(true);
    try {
      const valifationRules = [
        {
          field: 'date',
          value: selectedTechnician?.date,
          customMessage: 'Please select Date',
        },
      ];

      let { isError, errors } = validateForm(valifationRules);
      if (isError) {
        setErrors(errors);
      } else {
        const pastHistory = {
          endpoint: `${apiBaseUrl.CLEAR_PAST_HISTORY}`,
          method: 'POST',
          body: {
            date: moment(selectedTechnician?.date).format('Y-MM-DD'),
          },
        };

        const response = await apiAction.mutateAsync(pastHistory);
        if (response.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setselectedTechnician({});
          setClearPastDialog(false);
          if (response?.data > 0) {
            // fetchPreventiveService();
            refetchPreventiveService();
          }
        }
      }
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      // Stop the loading state regardless of success or failure
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    try {
      const pastHistory = {
        endpoint: `${apiBaseUrl.MARK_AS_COMPLETE}`,
        method: 'POST',
        body: {
          services_ids: selectedServiceIds,
        },
      };

      const { data } = await apiAction.mutateAsync(pastHistory);
      if (data) {
        // fetchPreventiveService();
        refetchPreventiveService();
        setSelecteedServiceIds([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onAMCinfoClick = (item: any) => {
    setSelectedItem(item);
    setOpenAMCinfoModal(true);
  };

  const onSearchClcik = () => {
    const { search, from, to } = searchData;
    if (!search?.trim() && !from && !to) {
      showToast({
        variant: 'destructive',
        message: 'Please enter minimum 3 character to search',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } else {
      // fetchPreventiveService();
      refetchPreventiveService();
    }
  };

  const onSearchChangeHandler = (field: string, value: any) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onViewAll = () => {
    setSearchData({
      search: '',
      from: null,
      to: null,
      searchInBranch: false,
    });
    setViewAll(true);
    setPage(1);
    // fetchPreventiveService();
  };

  const onAllPreventiveServicesSelect = (checked: boolean) => {
    let tempServiceList = serviceList?.map((x) => ({
      ...x,
      id: x.id, // Assuming index as the unique identifier if 'id' doesn't exist
      isChecked: checked,
    }));
    setServiceList(tempServiceList);
    setSelectAllServices(checked);
    if (checked) {
      // Collect IDs of selected items
      const selectedIds = tempServiceList
        ?.filter((item) => item.isChecked)
        .map((item) => item.id) as any;
      setSelecteedServiceIds(selectedIds);
    } else {
      setSelecteedServiceIds([]);
    }
  };

  const onServiceChecked = (item: any, checked: boolean) => {
    let tempServiceList = [...(serviceList || [])];
    item.isChecked = checked;
    tempServiceList = updateArray(tempServiceList, item);
    setServiceList(tempServiceList);

    // Collect IDs of selected items
    const selectedIds = tempServiceList
      .filter((item) => item.isChecked)
      .map((item) => item.id) as any;
    let selectedDeviceList = getSelectedListCount(tempServiceList);
    setSelecteedServiceIds(selectedIds);
    setSelectAllServices(selectedDeviceList == serviceList?.length);
  };

  const getSelectedListCount = (list?: Array<ArrayProps>) => {
    const selectedList = list?.filter((x) => x.isChecked);
    if (selectedList !== undefined) {
      return selectedList.length;
    } else {
      return 0;
    }
  };

  const onNext = () => {
    setPage((prePage) => prePage + 1);
  };
  const onPrevious = () => {
    setPage((prePage) => prePage - 1);
  };

  const columns: PreventiveServiceColumn[] = [
    ...(!isPBEnterprise
      ? [
          {
            accessorKey: 'check_action',
            className: 'max-w-10',
            header: (
              <CheckboxItem
                id='all'
                checked={isSelectAllService}
                onCheckedChange={onAllPreventiveServicesSelect}
                ariaLabel=''
              />
            ),
            render: (item: any) => (
              <>
                <CheckboxItem
                  id={item.id}
                  checked={item.isChecked}
                  onCheckedChange={(checked) => onServiceChecked(item, checked)}
                  ariaLabel=''
                />
              </>
            ),
          },
        ]
      : []),
    {
      accessorKey: 'customer_id',
      header: 'Customer Id',
      className: 'max-w-[95px]',
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      className: 'max-w-[140px]',
      // render: (item: any) => <span>{item.customer.name}</span>,
      render: (item: any) => (
        <div>
          <Link
            href={`${ROUTES.CUSTOMERS}/${item?.customer_id}`}
            className='flex font-bold text-blueButton-default'
            onClick={(e) => {
              e.preventDefault();
              router.push(`${ROUTES.CUSTOMERS}/${item?.customer_id}`);
            }}
          >
            {item?.customer?.name}
          </Link>

          {item?.device?.branch && (
            <>
              <br />
              <span className='font-semibold'>Branch:</span>
              <span> {item?.device?.branch?.name}</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      render: (item: any) => (
        <span className='block  '>
          {item?.customer?.address_1}
          {item?.customer?.address_2 || ''
            ? ',' + ' ' + (item?.customer?.address_3 || '')
            : ''}{' '}
          {item?.customer?.city?.name}
          {item?.device?.branch && (
            <div className='text-xs'>
              <span className='font-semibold'>Branch Address:</span>
              <span>
                {item?.device?.branch?.address_1}
                {item?.device?.branch?.address_2
                  ? ',' + item?.device?.branch?.address_2
                  : ''}
                {item?.device?.branch?.address_3
                  ? ',' + item?.device?.branch?.address_3
                  : ''}
              </span>
            </div>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'modal',
      header: 'Model Number',
      className: 'max-w-[120px]',
      render: (item: any) => (
        <span>
          {item?.device?.unit?.machine_model?.model_number || 'Not Known'}
        </span>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      className: 'max-w-[180px]',
      render: (item: any) => (
        <span>
          {item?.customer?.phone}
          {item?.device?.branch && (
            <div className='text-xs'>
              <span className='font-semibold'>Branch Contact:</span>
              <span>{item?.device?.branch?.phone}</span>
            </div>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'amc_plan',
      header: 'AMC',
      className: 'max-w-[100px] break-words break-all	',
      render: (item: any) => (
        <span>{item?.amc_registration?.amc_plan?.amc_code}</span>
      ),
    },
    {
      accessorKey: 'device_id',
      header: 'Device Id',
      className: 'max-w-[80px]',
    },
    {
      accessorKey: 'device',
      header: 'Device',
      className: 'max-w-[120px]',
      render: (item: any) => (
        <span>
          {item?.device?.name}
          {item?.device?.unit?.machine_model?.model_number
            ? ` - ${item?.device?.unit?.machine_model?.model_number}`
            : ''}
        </span>
      ),
    },
    {
      accessorKey: 'service_date',
      header: 'Service Date',
      className: 'max-w-[120px]',
      render: (item: any) => (
        <span>{moment(item?.service_date).format('yyyy-MM-DD')}</span>
      ),
    },
    {
      accessorKey: 'service_type',
      header: 'Service Type',
      className: 'max-w-[120px]',
      render: (item: any) => (
        <span>{item?.amc_service_type?.service_type}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      className: 'max-w-[150px]',
      render: (item: any) => (
        <div className='flex flex-col gap-2'>
          <Button
            variant='outline'
            size={'sm'}
            className='!h-auto max-w-[80px] !px-2 !py-1 !text-[10px]'
            onClick={() => onAMCinfoClick(item)}
          >
            AMC Info
          </Button>
          {!isPBEnterprise && (
            <Button size={'sm'} onClick={() => openAssignDialog(item)} className='!h-auto max-w-[80px] !px-2 !py-1 !text-[10px] uppercase border'>
              Assign
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleInputChange = (key: string, value: any) => {
    setselectedTechnician((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    if (isRequired(value)) {
      setErrors((prevError) => {
        return {
          ...prevError,
          [key]: '',
        };
      });
    }
  };

  const openAssignDialog = (item: any) => {
    setAssignDialog(true);
    setSelectedItem(item);
    setSelecteedServiceIds([item.id]);
  };

  const isSelectedTechnician = (item: any) => {
    return selectedTechnician?.technician?.some(
      (tech: any) => tech.id === item.id
    );
  };

  const handleTechnicianSelect = (key: string, item: any) => {
    if (isSelectedTechnician(item)) {
      setselectedTechnician((prevData) => ({
        ...prevData,
        [key]: selectedTechnician?.technician?.filter(
          (tech: any) => tech.id !== item.id
        ),
      }));
    } else {
      setselectedTechnician((prevData) => ({
        ...prevData,
        [key]: [...(selectedTechnician?.technician || []), item],
      }));
    }
    if (isRequired(key)) {
      setErrors((prevError) => {
        return {
          ...prevError,
          technician_id: '',
        };
      });
    }
  };

  const handleConfirmationDialog = async () => {
    setClearPastDialog(true);
  };

  const handleDateRangeChange = (field: string, value: any) => {
    setDateRange((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
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

        let endpoint: string = `${apiBaseUrl.PREVENTIVE_SERVICES}/export?from=${fromDate}&to=${toDate}`;

        const blob: Blob = await downloadFile(endpoint);

        const blobUrl: string = window.URL.createObjectURL(blob);

        const a: HTMLAnchorElement = document.createElement('a');
        a.href = blobUrl;
        a.download = `preventive-services.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobUrl);
        setExportDialog(false);
      }
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      // Stop the loading state regardless of success or failure
      setLoading(false);
    }
  };

  const openMultipalAssignDialog = () => {
    setAssignDialog(true);
  };

  return (
    <div className='h-full overflow-hidden p-3'>
      <div className='flex h-full grow flex-col gap-3 bg-white p-3'>
        <Breadcrumb />

        <div
          className={`grid w-full grid-flow-col ${
            isViewAll || isPBEnterprise ? 'auto-cols-fr' : 'auto-cols-fr'
          }  items-center gap-5`}
        >
          <div className={isPBEnterprise ? 'col-span-2' : isViewAll ? 'col-span-2' : ''}>
            <InputField
              type='text'
              size='sm'
              label=''
              placeholder='Name or User Id'
              value={searchData?.search}
              onSubmit={onSearchClcik}
              onChange={(e) => onSearchChangeHandler('search', e)}
            />
          </div>
          {!isViewAll && !isPBEnterprise ? (
            <>
              <DatepickerComponent
                label=''
                placeholderText='From'
                dateFormat='dd/MM/yyyy'
                size='sm'
                onChange={(e) => {
                  onSearchChangeHandler('from', e);
                }}
                selectedDate={searchData.from}
              />
              <DatepickerComponent
                label=''
                size='sm'
                placeholderText='To'
                dateFormat='dd/MM/yyyy'
                onChange={(e) => {
                  onSearchChangeHandler('to', e);
                }}
                selectedDate={searchData.to}
              />
            </>
          ) : null}
          {!isViewAll && (
            <CheckboxItem
              key='SearchInBranch'
              checked={searchData?.searchInBranch} // Check if the current brand id is in the selectedBrandIds array
              ariaLabel='Search In Branch'
              id={`SearchInBranch`}
              onCheckedChange={(e) =>
                onSearchChangeHandler('searchInBranch', e)
              }
            />
          )}
          <Button
            variant={'blue'}
            className='!w-full'
            size={'sm'}
            onClick={onSearchClcik}
            disabled={isPreventiveServiceLoading}
            icon={<IconSearch className='h-4 w-4 text-white' />}
          >
            Search
          </Button>
          {!isViewAll ? (
            <Button
              variant={'blue'}
              className='!w-full'
              size={'sm'}
              onClick={onViewAll}
              disabled={isPreventiveServiceLoading}
            >
              View All
            </Button>
          ) : null}
          {isViewAll ? (
            <>
              <span className='font-bold col-span-2'>
                Total No of Pending Services : {total || 0}
              </span>
              <div>
                <Button
                  size={'sm'}
                  variant={'blue'}
                  onClick={() => setExportDialog(true)}
                >
                  Export
                </Button>
              </div>
            </>
          ) : null}
        </div>
        <div className='flex h-full flex-col overflow-auto'>
          {!isPBEnterprise && (
            <div className='flex gap-4'>
              {isViewAll ? (
                <Button
                  size={'sm'}
                  variant={'blue'}
                  className='mb-3'
                  onClick={() => handleConfirmationDialog()}
                >
                  Clear Past
                </Button>
              ) : null}

              {selectedServiceIds?.length > 0 && (
                <>
                  {isViewAll && (
                    <Button
                      size={'sm'}
                      variant={'blue'}
                      className='mb-3'
                      onClick={() => markAsComplete()}
                    >
                      Mark as Complete
                    </Button>
                  )}
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    className='mb-3'
                    disabled={!selectedServiceIds.length}
                    onClick={() => openMultipalAssignDialog()}
                  >
                    Assign Technician
                  </Button>
                </>
              )}
            </div>
          )}
          <TableComponent
            columns={columns}
            data={serviceList}
            searchTerm={false}
            currentPage={page}
            totalPage={total}
            entriesPerPage={PERPAGE}
            onNext={onNext}
            onPrevious={onPrevious}
          />

          {openAMCInfoModal && (
            <AmcInfoDialog
              open={openAMCInfoModal}
              onClose={() => setOpenAMCinfoModal(false)}
              customerId={selectedItem.customer_id}
              selectedAMCId={selectedItem.amc_reg_id}
              apiBaseUrl={apiBaseUrl}
              helperData={helperData}
              isEnterpriseCustomer={selectedItem?.customer?.is_enterprise}
            />
          )}
        </div>
      </div>

      {assignDialog && (
        <AssignTechniciansDialog
          open={assignDialog}
          onClose={() => {
            setAssignDialog(false), setselectedComplaint({});
            setSelectedSkill(-1);
            setSelecteedServiceIds([]);
            // fetchPreventiveService();
            refetchPreventiveService();
          }}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
          technicianList={technicianList}
          selectedComplaintIds={selectedServiceIds}
          preventiveServices={true}
        />
      )}

      <MyDialog
        open={showExportDialog}
        onClose={() => {
          setExportDialog(false);
          setErrors({});
        }}
        isShowClose={false}
        title={'Excel'}
        buttons={[
          {
            text: 'Export',
            variant: 'blue',
            size: 'sm',
            onClick: () => onExportClick(),
            btnLoading: loading,
            icon: loading ? <IconLoading /> : '',
          },
        ]}
      >
        <div className='flex flex-col gap-4 p-4'>
          <div className='grid grid-cols-3 items-center gap-4'>
            <label className='text-lg'>Select Range</label>
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              placeholderText='From'
              onChange={(e) => handleDateRangeChange('from', e)}
              selectedDate={dateRange?.from}
              error={errors?.from || ''}
            />
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              placeholderText='To'
              onChange={(e) => handleDateRangeChange('to', e)}
              selectedDate={dateRange?.to}
              error={errors?.to || ''}
            />
          </div>
        </div>
      </MyDialog>

      <MyDialog
        open={clearPastDialog}
        onClose={() => {
          setClearPastDialog(false);
        }}
        isShowClose={false}
        title={'Enter Date'}
        buttons={[
          {
            text: 'Submit',
            variant: 'blue',
            size: 'sm',
            onClick: () => clearPastHistory(),
            btnLoading: loading,
            icon: loading ? <IconLoading /> : '',
          },
        ]}
      >
        <div className='flex flex-col gap-4 p-4'>
          <label className='mb-2 block font-bold'>
            Delete all preventative services due, before the following date:
          </label>
          <div className='flex gap-4'>
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              onChange={(e) => handleInputChange('date', e)}
              selectedDate={selectedTechnician?.date}
              error={errors?.date || ''}
            />
          </div>
        </div>
      </MyDialog>
    </div>
  );
};

export default PreventiveService;
