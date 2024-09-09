// components/ComplaintsListItem.tsx
import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  IconLoading,
  IconMapPin,
  IconPencil,
  IconPersonFill,
  IconTelephoneFill,
  IconWrench,
} from '@/utils/Icons';
import { AccordionContent, AccordionTrigger } from './ui/accordion';
import moment from 'moment';
import ROUTES, {
  COMPLAIN_STATUS,
  DATE_FORMAT_FULL_DATE_TIME,
  DDMMYYYY,
  accountTypeRender,
  getBaseUrl,
} from '@/utils/utils';
import { usePathname } from 'next/navigation';
import CheckboxItem from './CheckboxItem';
import { useAccessRights } from '@/hooks/useAccessRights';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import MyDialog from './MyDialog';
import { ScrollArea } from './ui/scroll-area';
import InputField from './InputField';
import SelectBox from './SelectBox';
import DatepickerComponent from './DatePicker';
import { validateForm } from '@/utils/FormValidationRules';

interface ComplaintsListItemProps {
  complaint: any;
  apiBaseUrl: any;
  openAssignDialog?: any;
  openQuotationDialog?: any;
  openNoteDialog?: any;
  openComplaintsDeleteDialog?: any;
  getReportDetail?: any;
  openComplaintStatusDialog(item: any): void;
  onCheckboxChange?: any;
  isDashboard?: boolean;
  isPastComplaints?: boolean;
  isManageServiceReport?: boolean;
  isTechnician?: boolean;
  selectedComplaintIds: string[]; // Array of IDs for selected complaints
  currentBucket?: string;
  refreshCompain?: any;
}

export type AssignPartner = {
  id: string;
  Name: string;
  Contact: string;
  button: any;
};

const ComplaintsListItem: React.FC<ComplaintsListItemProps> = ({
  complaint,
  apiBaseUrl,
  openAssignDialog,
  openQuotationDialog,
  openNoteDialog,
  openComplaintsDeleteDialog,
  openComplaintStatusDialog,
  onCheckboxChange,
  selectedComplaintIds,
  isDashboard,
  isPastComplaints,
  getReportDetail,
  isManageServiceReport,
  isTechnician,
  currentBucket,
  refreshCompain,
}) => {
  const [serviceReportDialog, setServiceReportDialog] = useState(false);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const currentDate = moment();
  const { isAccess } = useAccessRights();
  const apiAction = useMutation(apiCall);
  const [complaintInfo, setComplainInfo] = useState<any>(complaint);
  const [editComplaintDialog, setEditComplainDialog] = useState<any>({
    show: false,
    selectedItem: null,
    isLoading: false,
  });
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [branchList, setBranchList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [branchDeviceList, setBranchDeviceList] = useState([]);
  const [requestType, setRequestType] = useState([]);

  const [accordionComplain, setAccordionComplain] = useState({
    customerId: 0,
    requestId: 0,
  });

  useEffect(() => {
    if (accordionComplain?.requestId) {
      fetchComplainDetail();
    }
  }, [accordionComplain?.requestId]);

  useEffect(() => {
    setComplainInfo(complaint);
  }, [complaint?.request_technician?.technician]);

  useEffect(() => {
    if (deviceList?.length > 0 && formData?.branch_id) {
      const branchBasedDevice = deviceList.filter(
        (x: any) => x?.branch_id == formData?.branch_id
      );
      setBranchDeviceList(branchBasedDevice);
    }
  }, [branchList, deviceList, formData?.branch_id]);

  const fetchComplainDetail = async () => {
    try {
      const apiData = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${accordionComplain.customerId}/request/${accordionComplain.requestId}/info`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      if (data) {
        setComplainInfo((preComplaintInfo: any) => ({
          ...data,
          ...preComplaintInfo,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
    }
  };

  const onChangeClick = (item: any) => {
    openComplaintStatusDialog(item);
  };

  const handleCheckboxChange = () => {
    onCheckboxChange(complaintInfo?.id); // Pass complaint ID to parent component
  };

  const AssignDate = complaintInfo?.request_technician?.technician
    ? complaintInfo?.request_technician?.assign_date
    : complaintInfo?.created_at;

  const onComplainShow = (customerId: number, requestId: number) => {
    setAccordionComplain({ customerId, requestId });
  };

  const openEditComplainDialog = () => {
    setEditComplainDialog((prev: any) => ({
      ...prev,
      show: true,
      selectedItem: complaintInfo,
    }));
    setFormErrors({});
    setFormData({
      branch_id: complaintInfo?.device?.branch_id,
      device_id: complaintInfo?.device?.id,
      request_type_id: complaintInfo?.request_type_id,
      assign_date: new Date(complaintInfo?.request_technician?.assign_date),
      inr: complaintInfo?.initial_price,
    });
    fetchBranch(complaintInfo?.customer_id);
    fetchDevices(complaintInfo?.customer_id);
    if (requestType.length == 0) {
      fetchRequestType();
    }
  };

  const onCloseEditComplainDialog = () => {
    setEditComplainDialog({
      show: false,
      selectedItem: null,
      isLoading: false,
    });
  };

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
      ...(field === 'branch_id' && { device_id: '' }),
    }));
    setFormErrors((prev: any) => ({
      ...prev,
      [field]: '',
    }));

    if (field === 'branch_id') {
      const branchBasedDevice = deviceList.filter(
        (x: any) => x?.branch_id == value
      );
      setBranchDeviceList(branchBasedDevice);
    }
  };

  const fetchBranch = async (customerId: string) => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/branch?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) {
        setBranchList(data);
      } else setBranchList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchDevices = async (customerId: any) => {
    try {
      const fetchDevice = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/device?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchDevice);
      setDeviceList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchRequestType = async () => {
    try {
      const fetchDevice = {
        endpoint: `${apiBaseUrl.REQUESTTYPE}?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchDevice);
      if (data) setRequestType(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleComplainSave = () => {
    const { branch_id, device_id, request_type_id, assign_date, inr } =
      formData;
    const valifationRules = [
      { field: 'branch_id', value: branch_id, message: 'Branch name' },
      {
        field: 'device_id',
        value: device_id,
        message: 'Device name',
      },
      {
        field: 'request_type_id',
        value: request_type_id,
        message: 'Request type',
      },
      { field: 'assign_date', value: assign_date, message: 'Assign date' },
      { field: 'inr', value: inr, message: 'INR' },
    ];

    let { isError, errors } = validateForm(valifationRules);
    if (!isError && moment(assign_date).isBefore(moment(new Date()))) {
      errors['assign_date'] =
        'Assign date and time must be greater than or equal to current date and time.';
      isError = true;
    }

    if (isError) {
      setFormErrors(errors);
    } else {
      let body = {
        branch_id,
        request_type_id,
        device_id,
        assign_date: moment(assign_date).format(`yyyy-MM-DD HH:mm`), //
        initial_price: inr,
      };
      updateRequest(body);
    }
  };

  const updateRequest = async (body: any) => {
    try {
      setEditComplainDialog((prev: any) => ({
        ...prev,
        isLoading: true,
      }));
      const postRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${editComplaintDialog?.selectedItem?.customer_id}/request/${editComplaintDialog?.selectedItem?.id}?_method=patch`,
        method: 'POST',
        body: body,
      };
      const response = await apiAction.mutateAsync(postRequest);
      if (response?.isError) {
        const error = {
          branch_id: response?.errors?.branch_id,
          inr: response?.errors?.initial_price,
          device_id: response?.errors?.device_id,
          request_type_id: response?.errors?.request_type_id,
          assign_date: response?.errors?.assign_date,
        };
        setFormErrors(error);
      } else {
        onCloseEditComplainDialog?.();
        refreshCompain?.();
      }
    } catch (e) {
      console.log('===> error', e);
    } finally {
      setEditComplainDialog((prev: any) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return (
    <>
      <AccordionTrigger
        className='text-left hover:no-underline'
        onClick={() =>
          onComplainShow(complaintInfo?.customer_id, complaintInfo?.id)
        }
      >
        <div className='grid w-full grid-cols-3 items-center justify-between  '>
          <div className='flex items-center gap-5 capitalize'>
            {isDashboard && !isPBEnterprise && !isPBAdmin && !isEnterprise && (
              <div className='relative z-20'>
                <CheckboxItem
                  onCheckedChange={handleCheckboxChange}
                  ariaLabel={''}
                  checked={selectedComplaintIds.includes(complaintInfo.id)}
                  id={`complaint_${complaintInfo.id}`}
                />
              </div>
            )}
            <div className='flex flex-col'>
              <div className='text-sm font-bold'>
                {moment(AssignDate).format(DATE_FORMAT_FULL_DATE_TIME)}
              </div>
              <span className='text-xs'>
                {moment(AssignDate).format('dddd')}
              </span>
            </div>
          </div>
          {(isDashboard ||
            isPastComplaints ||
            isManageServiceReport ||
            isTechnician) && (
            <>
              <div>
                {complaintInfo?.customer && (
                  <Link
                    href={`/${basePath}/dashboard/customers/${complaintInfo?.customer_id}`}
                    className='inline-flex font-bold text-blueButton-default'
                  >
                    <div className='flex'>
                      <IconPersonFill className='mr-3 h-5 w-5' />
                      {`${complaintInfo?.customer?.name}`}
                    </div>
                  </Link>
                )}
              </div>
            </>
          )}
          {!isTechnician && (
            <>
              {complaintInfo?.request_technician?.technician ? (
                <div>
                  <Link
                    href={
                      isEnterprise
                        ? ''
                        : `/${basePath}/dashboard/technician/${complaintInfo?.request_technician?.technician?.id}`
                    }
                    className={`inline-flex font-bold text-blueButton-default ${
                      isEnterprise && 'cursor-text'
                    }`}
                  >
                    <div className='flex'>
                      <IconWrench className='mr-3 h-5 w-5' />
                      {`${complaintInfo?.request_technician?.technician?.name} - ${complaintInfo?.request_technician?.technician?.phone}`}
                    </div>
                  </Link>
                </div>
              ) : (
                <span className='text-pbRed'>Unassigned </span>
              )}
            </>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className='flex flex-col gap-4'>
        <div className='grid grid-cols-3 pr-4'>
          <div className='flex flex-col gap-5'>
            <div>
              <span className='inline-flex items-center rounded-md bg-dark-default px-2 py-1 text-xs font-medium text-white'>
                Complaint ID:- {complaintInfo?.id}
              </span>
            </div>
            {complaintInfo?.request_technician?.technician && (
              <div className='text-sm font-bold'>
                Scheduled At :{' '}
                <span className='text-xs font-normal'>
                  {moment(
                    complaintInfo?.request_technician?.assign_date
                  ).format('HH:mm:ss')}
                </span>
              </div>
            )}
            {!isEnterprise && (
              <div>
                <div className='flex'>
                  <div className='flex flex-col gap-3'>
                    {complaintInfo?.request_status_id !==
                      COMPLAIN_STATUS.CANCELLED &&
                      complaintInfo?.request_status_id !==
                        COMPLAIN_STATUS.RESOLVED &&
                      complaintInfo?.request_status_id !==
                        COMPLAIN_STATUS.CLOSED && (
                        <Button
                          variant={'outline'}
                          color={'danger'}
                          className='border-r-pbHeaderRed'
                          size={'sm'}
                          onClick={() => openAssignDialog(complaint)}
                        >
                          {' '}
                          {complaintInfo?.request_technician?.technician
                            ? 're-assign technician'
                            : 'assign technician'}
                        </Button>
                      )}
                    {complaintInfo?.request_technician?.technician &&
                    (complaintInfo?.request_status_id ===
                      COMPLAIN_STATUS.ASSIGNED ||
                      complaintInfo?.request_status_id ===
                        COMPLAIN_STATUS.IN_PROGRESS) &&
                    moment(
                      complaintInfo?.request_technician?.assign_date,
                      'YYYY-MM-DD HH:mm:ss'
                    ).isSameOrAfter(currentDate) ? (
                      <Button
                        variant={'outline'}
                        color={'orange'}
                        className='border-r-pbHeaderRed'
                        size={'sm'}
                        onClick={() => openAssignDialog(complaint, 'assistant')}
                      >
                        Assign Assistant
                      </Button>
                    ) : null}
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => openQuotationDialog(complaint)}
                    >
                      {' '}
                      send / view Quotation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='flex flex-col gap-8'>
            <address className='pr-8'>
              <div>{complaintInfo?.device?.branch?.address_1}</div>
              <div>{complaintInfo?.device?.branch?.address_2}</div>
              <div>{complaintInfo?.device?.branch?.address_3}</div>
              <div>{complaintInfo?.device?.branch?.city?.name}</div>
              <div>
                {complaintInfo?.device?.branch?.state?.name} -{' '}
                {complaintInfo?.device?.branch?.zip}
              </div>
            </address>
            <span className='flex items-center gap-2 font-bold'>
              {' '}
              <IconTelephoneFill />
              Contact-No : {complaintInfo?.device?.branch?.phone}
            </span>
          </div>
          <div className='relative flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
              {isPBPartner || isPBAdmin ? (
                <Link
                  href={`${
                    isPBAdmin
                      ? `/${basePath}/dashboard/manage-partners/`
                      : `/${basePath}/dashboard/partners-details/`
                  }${complaintInfo?.device?.device_assign_partner?.partner_id}`}
                  className={`flex font-bold text-blueButton-default ${
                    isPBPartner && complaintInfo?.customer?.is_enterprise == 1
                      ? 'pointer-events-none'
                      : ''
                  }`}
                >
                  {accountTypeRender(
                    complaintInfo?.device?.device_assign_partner?.partner?.type
                  )}
                  {isPBPartner && complaintInfo?.customer?.is_enterprise == 1
                    ? 'Pureblu'
                    : complaintInfo?.device?.device_assign_partner?.partner
                        ?.name}
                </Link>
              ) : (
                <div className='flex font-bold text-blueButton-default'>
                  {accountTypeRender(
                    complaintInfo?.device?.device_assign_partner?.partner?.type
                  )}
                  {complaintInfo?.device?.device_assign_partner?.partner?.name}
                </div>
              )}
              <div className='flex gap-2'>
                <IconMapPin />
                {complaintInfo?.device?.branch?.city?.name}
              </div>
            </div>
            {(isDashboard && !isEnterprise) && (
              <div className='absolute right-0'>
                <Button variant={'link'} onClick={openEditComplainDialog}>
                  <IconPencil className='h-6 w-6 text-pbHeaderBlue' />
                </Button>
              </div>
            )}
            <div className='flex flex-col gap-2 font-bold capitalize'>
              <p>
                Complaint Created By:-{' '}
                {complaintInfo?.created_by_info?.full_name}
              </p>
              <p>
                Complaint Created On:-{' '}
                {moment(complaintInfo?.created_at).format(DDMMYYYY)}
              </p>
              {complaintInfo?.previous_bucket && (
                <p>Previous Bucket: {complaintInfo?.previous_bucket}</p>
              )}
            </div>
            {!isEnterprise && (
              <div className='flex  flex-col items-start gap-3'>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  className='min-w-[10rem]'
                  onClick={() => openNoteDialog(complaint)}
                >
                  Note
                </Button>
                {isAccess && (
                  <Button
                    variant={'outline'}
                    color={'danger'}
                    size={'sm'}
                    className='min-w-[10rem]'
                    onClick={() => openComplaintsDeleteDialog(complaint)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {complaintInfo?.service_reports?.length > 0 && (
          <div className='grid grid-cols-2 border p-3'>
            <div className='flex gap-4'>
              <div className='whitespace-nowrap font-bold'>
                Service Report No :{' '}
              </div>
              <div className='flex flex-wrap gap-5'>
                {complaintInfo?.service_reports.map((item: any) => {
                  return (
                    <Button
                      key={item.id}
                      variant={'link'}
                      onClick={() => getReportDetail(item, complaint)}
                      className='h-auto p-0 font-bold text-blueButton-default'
                    >
                      {item?.id}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className='grid grid-cols-3 border p-3'>
          <div className='flex gap-4'>
            {complaintInfo?.device?.is_mapped == 1 && !isEnterprise ? (
              <Link
                href={`/${basePath}/dashboard/complains-details/${complaintInfo?.customer?.id}/service-report/${complaintInfo?.id}`}
                className={`flex font-bold text-blueButton-default `}
              >
                Device Name:
              </Link>
            ) : (
              <span className='flex font-bold'>Device Name:</span>
            )}
            <div className='capitalize'>{complaintInfo?.device?.name}</div>
          </div>
          <div className='flex gap-4'>
            <div className='font-bold'>
              {isPBAdmin || isEnterprise ? (
                <span className='flex font-bold'>Complaint Type:</span>
              ) : (
                <>
                  {complaintInfo?.device?.is_mapped == 1 ? (
                    <Link
                      href={`/${basePath}/dashboard/complains-details/${complaintInfo?.customer?.id}/service-report/${complaintInfo?.id}`}
                      className='flex font-bold text-blueButton-default'
                    >
                      Complaint Type:
                    </Link>
                  ) : (
                    <span className='flex font-bold'>Complaint Type:</span>
                  )}
                </>
              )}
            </div>
            <div>{complaintInfo?.request_type?.name}</div>
          </div>
          <div className='flex gap-4'>
            <div className='font-bold'> Complaint Status:</div>
            <div className='flex'>
              {complaintInfo?.request_status?.name}
              {!isEnterprise && (
                <>
                  {' '}
                  |
                  <Button
                    variant={'link'}
                    onClick={() => onChangeClick(complaint)}
                    className='ml-2 flex h-auto p-0 text-blueButton-default'
                  >
                    Change
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className='grid grid-cols-3 border p-3'>
          {complaintInfo?.request_technician?.no_of_assistants &&
            currentBucket == 'Escalated' && (
              <div className='flex gap-4'>
                <div className='font-bold'>Nos of Requested Assistant: </div>
                <div>{complaintInfo?.request_technician?.no_of_assistants}</div>
              </div>
            )}
          <div className='flex gap-4'>
            <div className='font-bold'>Nos of Assistant: </div>
            <div>{complaintInfo?.assistants?.length || 0}</div>
          </div>
          <div className='flex gap-4'>
            <div className='font-bold'>Assistant: </div>
            <div>
              <span>
                {complaintInfo?.assistants
                  ?.map((assistant: any) => assistant.name)
                  ?.join(', ') || 'NA'}
              </span>
            </div>
          </div>
        </div>
      </AccordionContent>
      {editComplaintDialog?.show && (
        <MyDialog
          open={editComplaintDialog?.show}
          onClose={onCloseEditComplainDialog}
          title='Edit Customer Complaint'
          ClassName='sm:max-w-[50%]'
          buttons={[
            {
              text: 'Save',
              variant: 'blue',
              size: 'sm',
              onClick: handleComplainSave,
              disabled: editComplaintDialog?.isLoading,
              icon: editComplaintDialog?.isLoading ? <IconLoading /> : '',
            },
          ]}
        >
          <ScrollArea className='grow '>
            <div className='flex grow flex-col overflow-auto p-4'>
              <div className='grid  gap-5'>
                <SelectBox
                  label='Branch Name'
                  options={branchList}
                  value={formData.branch_id || ''}
                  onChange={(e) => handleInputChange('branch_id', e)}
                  error={formErrors?.branch_id || ''}
                />
                <SelectBox
                  label='Device Name'
                  options={branchDeviceList}
                  value={formData.device_id || ''}
                  onChange={(e) => handleInputChange('device_id', e)}
                  error={formErrors?.device_id || ''}
                />
                <SelectBox
                  label='Complaint Type'
                  options={requestType}
                  value={formData.request_type_id || ''}
                  onChange={(e) => handleInputChange('request_type_id', e)}
                  error={formErrors?.request_type_id || ''}
                />
                <DatepickerComponent
                  showTimeSelect
                  label='Assign Date'
                  minDate={new Date()}
                  minTime={new Date().setHours(23, 59, 59, 999)}
                  maxTime={
                    formData?.assign_date &&
                    new Date(formData?.assign_date).toDateString() ===
                      new Date().toDateString()
                      ? new Date()
                      : new Date().setHours(0, 0, 0, 0)
                  }
                  dateFormat='dd/MM/yyyy HH:mm'
                  onChange={(e) => handleInputChange('assign_date', e)}
                  selectedDate={formData?.assign_date}
                  error={formErrors?.assign_date || ''}
                />
                <InputField
                  type='tel'
                  label='INR'
                  value={formData?.inr || ''}
                  onChange={(e) => handleInputChange('inr', e)}
                  error={formErrors?.inr || ''}
                />
              </div>
            </div>
          </ScrollArea>
        </MyDialog>
      )}
    </>
  );
};

export default memo(ComplaintsListItem);
