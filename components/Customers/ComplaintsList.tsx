import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '@/context/dataProvider';
import { useMutation } from 'react-query';
import { apiCall, downloadFile } from '@/hooks/api';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionItem } from '../ui/accordion';
import { Button } from '../ui/button';
import {
  IconBxErrorCircle,
  IconDownload,
  IconExternalLink,
  IconLoading,
  IconSearch,
} from '@/utils/Icons';
import { useParams, usePathname } from 'next/navigation';
import ComplaintsListItem from '../ComplaintsListItem';
import MyDialog from '../MyDialog';
import DatepickerComponent from '../DatePicker';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import { showToast } from '../Toast';
import InputField from '../InputField';
import SelectBox from '../SelectBox';
import ROUTES, {
  BRANCHLIST,
  CUSTOMER,
  DEVICELIST,
  OptionType,
  REFRESHCOMPLAINTLIST,
  deleteArrayItem,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import moment from 'moment';
import SearchInput from '../SearchInput';
import AddNote from '../Note/AddNote';
import ConfirmationDialog from '../ConfirmationDialog';
import AssignTechniciansDialog from '../AssignTechniciansDialog';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import QuotationDialog from '../QuotationDialog';
import ComplainStatusChangeDialog from '../ComplainStatusChangeDialog';
import ServiceReportDialog from '../Service Report/ServiceReportDialog';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import useFetchComplaints from '@/hooks/useFetchComplaints';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import Pagination from '../Pagination';
import useDebounce from '../../hooks/useDebounce';
import MultiSelectDropdown from '../MultiSelect';

interface FormData {
  [key: string]: any;
}

const ComplaintsList = ({
  apiBaseUrl,
  isTechnician,
  isPastComplaints,
  isManageServiceReport,
}: any) => {
  const [filteredComplaintList, setFilteredComplainList] = useState<
    Array<FormData>
  >([]);
  const { state, setData } = useContext(DataContext);
  const apiAction = useMutation(apiCall);
  const { id } = useParams();
  const [assignDialog, setAssignDialog] = useState(false);
  const [quotationDialog, setQuotationDialog] = useState(false);
  const [selectedTechnician, setselectedTechnician] = useState<FormData>();
  const [selectedComplaint, setselectedComplaint] = useState<FormData>();
  const [errors, setErrors] = useState<FormData>();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState(-1);
  const [filteredTechnicianData, setfilteredTechnicianData] =
    useState<FormData>();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isConfirmation, setConfirmation] = useState(false);
  const [complainStatusModal, setComplainStatusModal] = useState(false);
  const [customerEmails, setCustomerEmails] = useState<Array<FormData>>([]);
  const [quotationList, setQuotationList] = useState<Array<FormData> | null>();
  const [selectedComplaintIds, setSelectedComplaintIds] = useState<string[]>(
    []
  );
  const [searchComplaintsTerm, setSearchComplaintsTerm] = useState<string>('');
  const [openServiceReportDialog, setOpenServiceReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>({});
  const [complaintDetail, setComplaintDetail] = useState(
    state?.setComplaintDetail || {}
  );
  const [branchList, setBranchList] = useState<Array<OptionType>>([]);
  const [deviceList, setDeviceList] = useState<Array<OptionType>>([]);
  const [searchData, setSearchData] = useState<{ [Key: string]: any }>({
    selectedDevice: { id: -1, name: 'All Devices' },
    selectedBranch: { id: -1, name: 'All Branches' },
    search: '',
    from: null,
    to: null,
    branch_id: -1,
    device_id: -1,
  });

  const [isDownloading, setDownloading] = useState(false);
  const [showDownloadComplain, setShowDownloadComplain] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  const { technicianList, updateTechnicianList } = useFetchTechnician(
    apiBaseUrl,
    selectedComplaint?.customer?.partner_id
  );
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const options = {
    isTechnician: isTechnician,
    id: id,
    isPastComplaints: isPastComplaints,
    isManageServiceReport: isManageServiceReport,
    searchData: searchData,
  };

  const {
    complaintList,
    fetchComplaints,
    updateComplaintList,
    currentPage,
    totalPages,
    perPage,
    setCurrentPage,
    complaintLoading,
  } = useFetchComplaints(apiBaseUrl, options);

  useEffect(() => {
    // Filter data based on the search term
    const filteredTechnicianData = technicianList?.filter((item: any) => {
      const searchMatch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let excludeItemById = true;
      if (selectedComplaint?.isAssistant) {
        excludeItemById =
          item.id !== selectedComplaint?.request_technician?.technician?.id;
      }
      if (selectedSkill == -1) {
        return searchMatch && excludeItemById;
      } else {
        const skillMatch = item.skills.some(
          (skill: any) => skill.skill_id === selectedSkill
        );
        return searchMatch && skillMatch && excludeItemById;
      }
    });

    setfilteredTechnicianData(filteredTechnicianData);
  }, [searchTerm, technicianList, selectedSkill, assignDialog]); // Add searchTerm and itemList as dependencies

  useEffect(() => {
    let tempBranchList: Array<OptionType> = [];
    if (state?.[BRANCHLIST]) tempBranchList = [...state?.[BRANCHLIST]];
    tempBranchList.unshift({ id: -1, name: 'All Branches' });
    setBranchList(tempBranchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[BRANCHLIST]]);

  useEffect(() => {
    let tempDeiceList: Array<OptionType> = [];
    if (state?.[DEVICELIST]) tempDeiceList = [...state?.[DEVICELIST]];
    tempDeiceList.unshift({ id: -1, name: 'All Devices' });
    setDeviceList(tempDeiceList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[DEVICELIST]]);

  useEffect(() => {
    let customerInfo = state?.[CUSTOMER];
    let emails: Array<FormData> = [{ id: 1, name: state?.[CUSTOMER]?.email }];
    if (customerInfo?.email_1) {
      emails.push({ id: 2, name: customerInfo.email_1 });
    }
    if (customerInfo?.email_2) {
      emails.push({ id: 3, name: customerInfo.email_2 });
    }
    setCustomerEmails(emails);
  }, [state?.[CUSTOMER]]);

  // useEffect(() => {
  //   let filteredData;

  //   if (
  //     searchComplaintsTerm.trim() === '' &&
  //     searchData.branch_id === -1 &&
  //     searchData.device_id === -1
  //   ) {
  //     // If search term is empty, set filtered data to the original complaint list
  //     filteredData = complaintList;
  //   } else {
  //     // Separate the filtering logic based on the isTechnician flag
  //     if (isTechnician) {
  //       // Filter complaints with `request` array when isTechnician is true
  //       filteredData = complaintList.map((complaint) => ({
  //         ...complaint,
  //         request: complaint.request.filter(
  //           ({ id, customer, request_technician }: any) => {
  //             const searchTerm = searchComplaintsTerm.toLowerCase().trim();
  //             return (
  //               id.toString() === searchTerm || // Filter based on exact ID match
  //               customer?.name.toLowerCase().includes(searchTerm) || // Filter by customer name
  //               customer?.phone?.toLowerCase().includes(searchTerm) || // Filter by customer phone number
  //               complaint?.device?.name?.toLowerCase().includes(searchTerm) || // Filter by device
  //               request_technician?.technician?.name
  //                 ?.toLowerCase()
  //                 .includes(searchTerm) || // Filter by technician name
  //               request_technician?.technician?.phone
  //                 ?.toLowerCase()
  //                 .includes(searchTerm) // Filter by technician number
  //             );
  //           }
  //         ),
  //       }));
  //     } else {
  //       // Filter complaints without `request` array when isTechnician is false
  //       filteredData = complaintList.filter((complaint) => {
  //         const searchTerm = searchComplaintsTerm.toLowerCase().trim();
  //         return (
  //           !complaint.request &&
  //           (complaint.id.toString() === searchTerm || // Filter based on exact ID match
  //             complaint.customer?.name.toLowerCase().includes(searchTerm) || // Filter by customer name
  //             complaint.customer?.phone?.toLowerCase().includes(searchTerm) || // Filter by customer phone number
  //             complaint?.device?.name?.toLowerCase().includes(searchTerm) || // Filter by device
  //             complaint?.request_technician?.technician?.name
  //               ?.toLowerCase()
  //               .includes(searchTerm) || // Filter by technician name
  //             complaint?.request_technician?.technician?.phone
  //               ?.toLowerCase()
  //               .includes(searchTerm)) && // Filter by technician number
  //           (searchData.branch_id === -1 ||
  //             complaint?.device?.branch_id === searchData.branch_id) && // Filter by branch
  //           (searchData.device_id === -1 ||
  //             complaint.device_id === searchData.device_id) // Filter by device
  //         );
  //       });
  //     }
  //   }

  //   // Set the filtered data to state
  //   setFilteredComplainList(filteredData);
  // }, [
  //   searchComplaintsTerm,
  //   complaintList,
  //   isTechnician,
  //   searchData.branch_id,
  //   searchData.device_id,
  // ]);

  const fetchReportDetail = async (report: any, complaint: any) => {
    try {
      // setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${complaint.customer_id}/request/${report?.request_id}/service-report/${report?.id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      // setReportList(response?.data);
      setSelectedReport(response?.data);
      setOpenServiceReportDialog(true);

      // setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      // setFetchLoading(false);
    }
  };

  const openAssignDialog = (complaint: any, assistant: string) => {
    if (assistant) {
      complaint.isAssistant = true;
      const tempList = deleteArrayItem(
        filteredTechnicianData as any,
        complaint?.request_technician?.technician
      );
      setfilteredTechnicianData(tempList);
    } else {
      complaint.isAssistant = false;
    }
    setSelectedComplaintIds([complaint.id]);
    setselectedComplaint(complaint);
    setselectedTechnician({});
    setErrors({});
    setAssignDialog(true);
  };

  const openQuotationDialog = (complaint: any) => {
    setselectedComplaint(complaint);
    setselectedTechnician({});
    setErrors({});
    setQuotationList(null);
    setQuotationDialog(true);
  };

  const openNoteDialog = (complaint: any) => {
    setselectedComplaint(complaint);
    setShowNoteModal(true);
  };

  const openComplaintsDeleteDialog = (complaint: any) => {
    setselectedComplaint(complaint);
    setConfirmation(true);
  };

  const onCloseNoteModal = () => {
    setShowNoteModal(false);
    setselectedComplaint({});
  };

  const handleDeleteConfirmationClick = async () => {
    setLoading(true);
    try {
      const deleteComplaint = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedComplaint?.customer_id}/request/${selectedComplaint?.id}?device_id=${selectedComplaint?.device_id}`,
        method: 'DELETE',
      };

      const { data, isError } = await apiAction.mutateAsync(deleteComplaint);
      if (!isError) {
        const tempComplaint = {
          data: deleteArrayItem(complaintList, selectedComplaint as any),
        };
        setConfirmation(false);
        updateComplaintList(tempComplaint.data);
        console.log(tempComplaint, 'tempComplaint');
        setData({ [REFRESHCOMPLAINTLIST]: new Date().toISOString() });
        setselectedComplaint({});
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const getReportDetail = async (report: any, complaint: any) => {
    setComplaintDetail(complaint);
    fetchReportDetail(report, complaint);
  };

  const onSearchClick = () => {
    setCurrentPage(1);
    const { search, from, to } = searchData;
    if (!search.trim() && !from && !to) {
      showToast({
        variant: 'destructive',
        message:
          isManageServiceReport || isPastComplaints
            ? 'Enter customer Id or Select date range to search'
            : 'Please enter minimum 3 character to search',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } else {
      fetchComplaints();
    }
  };

  const onSearchChangeHandler = (field: string, value: any) => {
    if (field === 'selectedBranch') {
      if (value.id === -1) {
        let tempDeiceList: Array<OptionType> = [];
        if (state?.[DEVICELIST]) tempDeiceList = [...state?.[DEVICELIST]];
        tempDeiceList.unshift({ id: -1, name: 'All Devices' });
        setDeviceList(tempDeiceList);
      } else {
        let tempDeiceList: Array<OptionType> = [];
        tempDeiceList = state?.[DEVICELIST]?.filter(
          (x: any) => x?.branch_id == value.id
        );
        tempDeiceList.unshift({ id: -1, name: 'All Devices' });
        setDeviceList(tempDeiceList);
      }
    }

    const { from, to } = searchData;

    if (
      isPastComplaints &&
      (from || field == 'from') &&
      (to || field == 'to')
    ) {
      const fromDate = moment(field == 'from' ? value : from);
      const toDate = moment(field == 'to' ? value : to);

      if (fromDate && toDate && toDate.isBefore(fromDate)) {
        showToast({
          variant: 'destructive',
          message: `${ERROR_MESSAGES?.fromDateGreater}`,
          icon: <IconBxErrorCircle className='h-6 w-6' />,
        });
        return;
      }

      const differenceInDays = toDate.diff(fromDate, 'days');
      if (differenceInDays > 365) {
        showToast({
          variant: 'destructive',
          message: `${ERROR_MESSAGES?.fromToDateLimit}`,
          icon: <IconBxErrorCircle className='h-6 w-6' />,
        });
        return;
      }
    }
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const downloadComplain = async () => {
    try {
      setDownloading(true);

      const fromDate = searchData?.from
        ? moment(searchData?.from).format('Y-MM-DD')
        : '';
      const toDate = searchData?.to
        ? moment(searchData?.to).format('Y-MM-DD')
        : '';

      let url = `${apiBaseUrl.PAST_REQUEST}/download`;

      // Initialize query parameters
      let queryParams = '';

      // Conditionally append parameters to the query string
      if (fromDate) {
        queryParams += `&from=${fromDate}`;
      }
      if (toDate) {
        queryParams += `&to=${toDate}`;
      }
      if (searchData?.search) {
        queryParams += `&search=${encodeURIComponent(searchData.search)}`;
      }

      if (isManageServiceReport) {
        url = `${API_ENDPOINTS_PARTNER.MANAGE_SERVICE_REPORT}/download`;
      }

      if (isPastComplaints) {
        let isError = false;
        if (!fromDate) {
          isError = true;
          setErrors((pre) => ({
            ...pre,
            from: `From date${ERROR_MESSAGES.required}`,
          }));
        }
        if (!toDate) {
          isError = true;
          setErrors((pre) => ({
            ...pre,
            to: `To date${ERROR_MESSAGES.required}`,
          }));
        }
        if (isError) {
          return;
        }
      }

      // Append the query parameters to the URL
      if (queryParams) {
        // Remove the leading '&' and add the query string to the URL
        url += `?${queryParams.substring(1)}`;
      }

      const blob: Blob = await downloadFile(url);
      const blobUrl: string = window.URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = isPastComplaints
        ? `past_complaints.xlsx`
        : `serviceReport.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.log('===>error in download', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDateRangeChange = (field: string, value: any) => {
    setDateRange((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    setErrors((prevState) => ({
      ...prevState,
      [field]: '',
    }));
  };

  const onDownloadClick = () => {
    setShowDownloadComplain(true);
  };

  const onDownloadComplainConfirm = async () => {
    const { to, from }: any = dateRange;
    const _error: any = {};
    let isFormError = false;
    if (!isRequired(to)) {
      _error['to'] = `To date${ERROR_MESSAGES.required}`;
      isFormError = true;
    }
    if (!isRequired(from)) {
      _error['from'] = `From date${ERROR_MESSAGES.required}`;
      isFormError = true;
    } else if (moment(to).isBefore(moment(from))) {
      _error['to'] = ERROR_MESSAGES.fromDateGreater;
      isFormError = true;
    }
    if (isFormError) {
      setErrors(_error);
    } else {
      try {
        const fromDate = moment(from).format('yyyy-MM-DD');
        const toDate = moment(to).format('yyyy-MM-DD');
        setDownloadLoader(true);
        let url = `${apiBaseUrl.CUSTOMERS}/${id}/request-download?from=${fromDate}&to=${toDate}`;
        if (isTechnician) {
          url = `${apiBaseUrl.TECHNICIAN}/${id}/customer-request-download?from=${fromDate}&to=${toDate}`;
        }
        const blob: Blob = await downloadFile(url);
        const blobUrl: string = window.URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = blobUrl;
        a.download = isTechnician
          ? `Technician Complaints.xlsx`
          : `Customer Complaints.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.log('===>error in download', error);
      } finally {
        setDownloadLoader(false);
        setShowDownloadComplain(false);
        setDateRange({
          from: null,
          to: null,
        });
      }
    }
  };

  const onNext = () => {
    setCurrentPage((prePage) => prePage + 1);
  };

  const onPrevious = () => {
    setCurrentPage((prePage) => prePage - 1);
  };

  return (
    <div className='flex w-full grow  flex-col gap-5 overflow-hidden'>
      {!isManageServiceReport && !isPastComplaints && !isTechnician && (
        <div className='grid w-full grid-cols-1 items-center gap-5 rounded-md bg-white p-5 lg:grid-cols-8 lg:gap-8'>
          <div className='lg:col-span-2'>
            <SearchInput
              value={searchData?.search}
              onSubmit={onSearchClick}
              onChange={(e) => onSearchChangeHandler('search', e)}
              className='w-full'
            />
          </div>
          <div className='flex items-center lg:col-span-2'>
            <Link
              color={'blueButton'}
              href={{
                pathname: `/${basePath}/dashboard/customers/${id}/${ROUTES.SEARCH_SERVICE_REPORTS}`,
                query: { customer: state?.[CUSTOMER]?.name },
              }}
              className='group flex items-center gap-2 font-medium text-primary'
            >
              <IconExternalLink className='h-4 w-4' />{' '}
              <span className='border-primary group-hover:border-b'>
                Search Service Reports
              </span>
            </Link>
          </div>
          <div className='lg:col-span-2'>
            <MultiSelectDropdown
              isMulti={false}
              options={branchList}
              closeMenuOnSelect={true}
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                onSearchChangeHandler('selectedBranch', selectedValues)
              }
              value={searchData.selectedBranch}
            />
          </div>
          <div className='lg:col-span-2'>
            <MultiSelectDropdown
              isMulti={false}
              options={deviceList}
              // menuIsOpen={true}
              closeMenuOnSelect={true}
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                onSearchChangeHandler('selectedDevice', selectedValues)
              }
              value={searchData.selectedDevice}
            />
          </div>
        </div>
      )}
      {isTechnician && (
        <div className='flex items-center gap-4'>
          <SearchInput
            value={searchData?.search}
            onSubmit={onSearchClick}
            onChange={(e) => onSearchChangeHandler('search', e)}
            className='w-full py-4'
          />
          {/* <Button
            variant={'blue'}
            className=''
            onClick={onSearchClick}
            icon={<IconSearch className='h-4 w-4 text-white' />}
          >
            Search
          </Button> */}
        </div>
      )}
      {isPastComplaints || isManageServiceReport ? (
        <div className='grid w-full grid-cols-3 items-center gap-5 bg-white p-5'>
          <InputField
            type='text'
            label=''
            placeholder='Customer Id or Customer Name or Contact No'
            value={searchData?.search}
            onSubmit={onSearchClick}
            onChange={(e) => onSearchChangeHandler('search', e)}
          />
          <div className='grid grid-cols-2 gap-5'>
            <DatepickerComponent
              label=''
              placeholderText='From'
              maxDate={isPastComplaints ? new Date() : undefined}
              dateFormat='dd/MM/yyyy'
              onChange={(value: any) => onSearchChangeHandler('from', value)}
              selectedDate={searchData.from}
              error={errors?.from || ''}
            />
            <DatepickerComponent
              label=''
              placeholderText='To'
              dateFormat='dd/MM/yyyy'
              maxDate={isPastComplaints ? new Date() : undefined}
              onChange={(value: any) => onSearchChangeHandler('to', value)}
              selectedDate={searchData.to}
              error={errors?.to || ''}
            />
          </div>
          <div className='grid grid-cols-2 gap-5'>
            {/* <Button
              variant={'blue'}
              className='!w-full'
              onClick={onSearchClick}
              icon={<IconSearch className='h-4 w-4 text-white' />}
            >
              Search
            </Button> */}
            {complaintList?.length > 0 ? (
              <Button
                variant={'blue'}
                className='!w-full'
                disabled={isDownloading}
                icon={isDownloading ? <IconLoading /> : <IconDownload />}
                onClick={downloadComplain}
              >
                Download
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-2 items-center justify-between'>
          <div className='font-bold'>Complaints List</div>
          <div className='flex justify-end text-pbHeaderBlue'>
            <Button
              variant={'link'}
              icon={<IconDownload />}
              onClick={onDownloadClick}
            >
              {' '}
              Download Complaints
            </Button>
          </div>
        </div>
      )}
      {(!complaintLoading && complaintList.length === 0) ? (
        <div className='grow flex flex-col items-center justify-center font-bold h-full'>
          No matching data.
        </div>
      ) :
        <ScrollArea className='h-full grow rounded-md '>
          <div className='grow overflow-auto '>

            <Accordion type='single' collapsible className='flex flex-col gap-5'>
              {complaintLoading ? (
                <>
                  {Array.from({ length: 8 }, (_, index) => (
                    <div key={index}>
                      <Skeleton key={index} className='min-h-[56px] w-full' />{' '}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {!isTechnician ? (
                    <>
                      {complaintList &&
                        complaintList?.map(
                          (complaint: any, deviceIndex: number) => {
                            return (
                              <AccordionItem
                                key={complaint?.id}
                                value={`main-item-${complaint?.id}`}
                                className='rounded-md border-none bg-white px-4 no-underline'
                              >
                                <ComplaintsListItem
                                  key={complaint?.id}
                                  complaint={complaint}
                                  apiBaseUrl={apiBaseUrl}
                                  openAssignDialog={openAssignDialog}
                                  openQuotationDialog={openQuotationDialog}
                                  openNoteDialog={openNoteDialog}
                                  openComplaintsDeleteDialog={
                                    openComplaintsDeleteDialog
                                  }
                                  openComplaintStatusDialog={(item) => {
                                    setComplainStatusModal(true);
                                    setselectedComplaint(item);
                                  }}
                                  isPastComplaints={isPastComplaints}
                                  isManageServiceReport={isManageServiceReport}
                                  isTechnician={isTechnician}
                                  getReportDetail={getReportDetail}
                                  selectedComplaintIds={selectedComplaintIds}
                                />
                              </AccordionItem>
                            );
                          }
                        )}
                    </>
                  ) : (
                    <>
                      {complaintList &&
                        complaintList?.map((item, index) => (
                          <div
                            key={index}
                            className='rounded-md border-none bg-white px-4 no-underline'
                          >
                            <div className='py-4 text-left hover:no-underline'>
                              <div className='flex w-full items-center justify-between pr-5'>
                                <div className='text-base font-bold'>
                                  {item?.name}
                                </div>
                                <div>Complaints: {item?.request?.total}</div>
                              </div>
                            </div>
                            {item?.request && (
                              <div>
                                <Accordion type='single' collapsible>
                                  {item?.request?.data?.map(
                                    (req_item: any, i: any) => (
                                      <AccordionItem
                                        key={i}
                                        value={`item-${i}`}
                                        className='mb-5 border px-4 no-underline'
                                      >
                                        <ComplaintsListItem
                                          complaint={req_item}
                                          apiBaseUrl={apiBaseUrl}
                                          openAssignDialog={openAssignDialog}
                                          openQuotationDialog={
                                            openQuotationDialog
                                          }
                                          openNoteDialog={openNoteDialog}
                                          openComplaintsDeleteDialog={
                                            openComplaintsDeleteDialog
                                          }
                                          openComplaintStatusDialog={(item) => {
                                            setComplainStatusModal(true);
                                            setselectedComplaint(item);
                                          }}
                                          selectedComplaintIds={
                                            selectedComplaintIds
                                          }
                                          getReportDetail={getReportDetail}
                                          isTechnician={isTechnician}
                                        />
                                      </AccordionItem>
                                    )
                                  )}
                                </Accordion>
                              </div>
                            )}
                          </div>
                        ))}
                    </>
                  )}
                </>
              )}
            </Accordion>
          </div>
        </ScrollArea>
      }
      {/* Pagination controls */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPrevious={onPrevious}
          onNext={onNext}
          isLoading={complaintLoading}
        />
      )}
      {assignDialog && (
        <AssignTechniciansDialog
          open={assignDialog}
          onClose={() => {
            setAssignDialog(false), setselectedComplaint({});
            setSelectedSkill(-1);
            setSelectedComplaintIds([]);
          }}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
          technicianList={filteredTechnicianData}
          selectedComplaintIds={selectedComplaintIds}
        />
      )}
      {quotationDialog && (
        <QuotationDialog
          open={quotationDialog}
          onClose={() => {
            setQuotationDialog(false), setselectedComplaint({});
          }}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
        />
      )}
      {openServiceReportDialog && (
        <ServiceReportDialog
          open={openServiceReportDialog}
          onClose={() => {
            setOpenServiceReportDialog(false), setSelectedReport({});
          }}
          apiBaseUrl={apiBaseUrl}
          complaintDetail={complaintDetail}
          reportListList={[selectedReport]}
        />
      )}
      {showNoteModal && (
        <AddNote
          apiBaseUrl={apiBaseUrl}
          isShow={showNoteModal}
          onClose={onCloseNoteModal}
          complaint={selectedComplaint}
        />
      )}
      <ConfirmationDialog
        isOpen={isConfirmation}
        onClose={() => {
          setConfirmation(false);
          setselectedComplaint({});
        }}
        buttons={[
          {
            text: 'Yes',
            variant: 'destructive',
            size: 'sm',
            onClick: handleDeleteConfirmationClick,
            btnLoading: loading,
            icon: loading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        Do You Really Want to Delete This Record
      </ConfirmationDialog>
      {complainStatusModal && (
        <ComplainStatusChangeDialog
          open={complainStatusModal}
          onClose={() => {
            setComplainStatusModal(false), setselectedComplaint({});
          }}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
        />
      )}{' '}
      <MyDialog
        open={showDownloadComplain}
        onClose={() => {
          setShowDownloadComplain(false);
          setDateRange({
            from: null,
            to: null,
          });
          setErrors({});
        }}
        title={'Download Complaints'}
        buttons={[
          {
            text: 'Download',
            variant: 'blue',
            size: 'sm',
            onClick: () => onDownloadComplainConfirm(),
            btnLoading: downloadLoader,
            icon: downloadLoader ? <IconLoading /> : '',
          },
        ]}
      >
        <div className='flex flex-col gap-4 p-4'>
          <div className='grid grid-cols-3 items-center gap-4'>
            <label className='text-lg'>Select Range</label>
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              placeholderText='From*'
              onChange={(e) => handleDateRangeChange('from', e)}
              selectedDate={dateRange?.from}
              error={errors?.from || ''}
            />
            <DatepickerComponent
              className='w-full'
              dateFormat='dd/MM/yyyy'
              placeholderText='To*'
              onChange={(e) => handleDateRangeChange('to', e)}
              selectedDate={dateRange?.to}
              error={errors?.to || ''}
            />
          </div>
        </div>
      </MyDialog>
    </div>
  );
};

export default ComplaintsList;
