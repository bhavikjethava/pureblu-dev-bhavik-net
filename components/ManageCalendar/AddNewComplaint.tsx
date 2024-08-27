import React, { useContext, useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import { ScrollArea } from '../ui/scroll-area';
import InputField from '../InputField';
import SelectBox from '../SelectBox';
import moment from 'moment';
import { API_ENDPOINTS_PARTNER, PARTNER_ } from '@/utils/apiConfig';
import ROUTES, {
  DEVICELIST,
  getBaseUrl,
  OptionType,
  REFRESHCOMPLAINTLIST,
  REFRESHDIVELIST,
  YYYYMMDD,
} from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { showToast } from '../Toast';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import { validateForm } from '@/utils/FormValidationRules';
import DatepickerComponent from '../DatePicker';
import { usePathname } from 'next/navigation';
import Select from 'react-select-virtualized';
import MultiSelectDropdown from '../MultiSelect';

interface AddNewComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  info: any;
  fetchRequest: any;
  technicianList: any;
  isEdit: boolean; // New prop for edit option
  apiBaseUrl: any;
  selectedPartner?: any;
}

interface FormData {
  [Key: string]: any;
}

const NEWDEVICE = 1;
const DEVICETYPE = [
  { id: NEWDEVICE, name: 'New' },
  { id: 2, name: 'Existing' },
];

const AddNewComplaint: React.FC<AddNewComplaintDialogProps> = ({
  open,
  onClose,
  info,
  fetchRequest,
  technicianList,
  isEdit, // Receive isEdit prop
  apiBaseUrl,
  selectedPartner,
}) => {
  const st = moment(info.dateStr); // Convert the clicked date to a Moment object
  const datec = st.format('YYYY-MM-DD'); // Format date using Moment.js
  const timec = st.format('HH:mm'); // Format time using Moment.js
  const dateTime = `${datec} ${timec}`; // Combined date and time

  const assignDate =
    info?.event?.extendedProps?.request_technician?.assign_date;
  const formattedDate = assignDate
    ? moment(assignDate).format('YYYY-MM-DD HH:mm')
    : null;

  const [deviceType, setDeviceType] = useState();
  const [customerList, setCustomerList] = useState([]);
  const [branchList, setBranchList] = useState<FormData[]>([]);
  const [requestTypeList, setRequestTypeList] = useState<Array<FormData>>([]);
  const [deviceList, setDeviceList] = useState<FormData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>();
  const [formData, setFormData] = useState<FormData>({
    complaint_id: info?.event?.extendedProps?.id,
    technician_id:
      info?.event?.extendedProps?.request_technician?.technician_id ||
      info?.resource?.id,
    assign_date: formattedDate || dateTime, // Set initial date value from props
    customer_id: info?.event?.extendedProps?.customer_id,
    branch_name: info?.event?.extendedProps?.device?.branch?.name,
    device_name: info?.event?.extendedProps?.device?.name,
    initial_price: info?.event?.extendedProps?.initial_price,
  });
  const [errors, setErrors] = useState<FormData>({});
  const [isLoading, setLoading] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const { state, setData } = useContext(DataContext);
  const apiAction = useMutation(apiCall);

  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  useEffect(() => {
    fetchCustomers();
    fetchRequestType();
  }, []);

  const fetchCustomers = async () => {
    try {
      let endpoint = `${apiBaseUrl.CUSTOMERS}?need_all=1&is_calendar_request=1`;
      if (isPBPartner) {
        endpoint += '&without_enterprise=1';
      }

      const apiData = {
        endpoint,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      setCustomerList(
        data.map((x: any) => {
          return { label: x?.name, value: x?.id };
        })
      );
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
    }
  };

  const fetchBranches = async (customerId: any) => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/branch?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setBranchList(data);
      else setBranchList([]);
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
      if (data) setRequestTypeList(data);
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

  const handleCustomerChange = (customerId: any) => {
    setSelectedCustomer(customerId);
    fetchBranches(customerId);
    fetchDevices(customerId);
  };

  const handleInputChange = (key: string, value: any) => {
    // When the device type is existing and a device is selected, set the branch_id
    if (key === 'device_id' && deviceType !== NEWDEVICE) {
      const selectedDevice = deviceList.find(
        (device: any) => device.id === value
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        device_id: value,
        ex_branch_id: selectedDevice?.branch_id, // Set branch_id based on selected device
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [key]: value,
      }));
    }
    setErrors((pre) => ({
      ...pre,
      [key]: '',
    }));
    if (key === 'customer_id') {
      handleCustomerChange(value);
    }
  };

  const onSave = async () => {
    let validationRules = [
      {
        field: 'request_type_id',
        value: formData?.request_type_id,
        message: 'Complain Type',
      },
      {
        field: 'initial_price',
        value: formData?.initial_price,
        message: 'Initial Price',
      },
      {
        field: 'deviceType',
        value: deviceType,
        message: 'Device Type',
      },
      {
        field: 'customer_id',
        value: formData?.customer_id,
        message: 'Customer Name',
      },
    ];

    if (deviceType === NEWDEVICE) {
      validationRules = [
        ...validationRules,
        {
          field: 'branch_id',
          value: formData?.branch_id,
          message: 'Installation Location',
        },
        {
          field: 'location',
          value: formData?.location,
          message: 'Device Location',
        },
      ];
    }
    if (deviceType !== NEWDEVICE) {
      validationRules = [
        ...validationRules,
        {
          field: 'device_id',
          value: formData?.device_id,
          message: 'Device Name',
        },
      ];
    }
    let { isError, errors } = validateForm(validationRules);
    if (isError) {
      setErrors(errors);
      return false;
    }

    let requestDevice: {
      request_type_id: any;
      assign_date: string;
      initial_price: any;
      branch_id?: any;
      ex_branch_id?: any;
      device_name?: string;
      device_id?: any;
    } = {
      request_type_id: formData?.request_type_id,
      assign_date: dateTime,
      initial_price: formData?.initial_price,
    };

    if (deviceType === NEWDEVICE) {
      requestDevice = {
        ...requestDevice,
        branch_id: formData?.branch_id,
        device_name: formData?.location,
      };
    } else {
      requestDevice = {
        ...requestDevice,
        branch_id: formData?.ex_branch_id,
        device_id: formData?.device_id,
      };
    }

    let body: FormData = {
      request_device_type: deviceType === NEWDEVICE ? 'new' : 'existing',
      customer_id: formData?.customer_id,
      // technician_id: Number(info.resource.id),
      request_devices: [requestDevice],
    };

    // Conditionally add the technician_id key
    if (info.resource.id != -1) {
      body.technician_id = Number(info.resource.id);
    }
    if (selectedPartner) {
      body.partner_id = selectedPartner;
    }

    postComplaint(body);
  };

  const postComplaint = async (body: any) => {
    try {
      setLoading(true);
      const postRequest = {
        endpoint: `${apiBaseUrl.CALENDAR_REQUEST}`,
        method: 'POST',
        body: body,
      };
      const response = await apiAction.mutateAsync(postRequest);
      if (response?.isError) {
        const error = {
          branch_id: response?.errors?.[`requests.0.branch_id`],
          initial_price: response?.errors?.['requests.0.initial_price'],
          name: response?.errors?.['requests.0.name'],
          request_type_id: response?.errors?.['requests.0.request_type_id'],
          assign_date: response?.errors?.['requests.0.assign_date'],
        };
        setErrors(error);
      } else {
        if (deviceType == NEWDEVICE) {
          setData({ [REFRESHDIVELIST]: !state?.[REFRESHDIVELIST] });
        }
        fetchRequest();
        onClose?.();
      }
    } catch (e) {
      console.log('===> error', e);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    try {
      // Start the loading state
      setLoading(true);
      const valifationRules = [
        {
          field: 'technician_ids',
          value: formData.technician_id,
          customMessage: 'Please select Technician',
        },
      ];

      let { isError, errors } = validateForm(valifationRules);

      let params = {
        assign_date: moment(formData?.assign_date).format('Y-MM-DD H:mm'),
        technician_ids: [formData.technician_id],
        request_ids: [formData.complaint_id],
      } as any;

      if (selectedPartner) {
        params.partner_id = selectedPartner;
      }

      if (isError) {
        setErrors(errors);
      } else {
        const technician = {
          endpoint: `${apiBaseUrl.ASSIGN_TECHNICIAN}?_method=patch`,
          method: 'POST',
          body: params,
        };

        const response = await apiAction.mutateAsync(technician);

        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          fetchRequest();
          onClose();
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

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add New Complaint'
      ClassName='sm:max-w-[70%] h-full grow max-h-[78%]'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: isEdit ? onUpdate : onSave,
          btnLoading: isLoading,
          icon: isLoading ? <IconLoading /> : '',
        },
      ]}
    >
      {' '}
      <ScrollArea className='grow bg-gray-100 p-4'>
        <div className='grid gap-5'>
          {isEdit && ( // Render only if not in edit mode
            <InputField
              type='text'
              label='Complaint ID'
              value={formData?.complaint_id || ''}
              onChange={(e) => handleInputChange('complaint_id', e)}
              disabled={isEdit}
            />
          )}

          <SelectBox
            label='Technician Name'
            options={technicianList}
            value={formData?.technician_id}
            onChange={(e) => handleInputChange('technician_id', e)}
            disabled={!isEdit}
          />

          <DatepickerComponent
            showTimeSelect
            label='Date & Time'
            disabled={!isEdit} // Disable if not in edit mode
            dateFormat='dd/MM/yyyy HH:mm'
            onChange={(e) => handleInputChange('assign_date', e)}
            selectedDate={new Date(formData?.assign_date)} // Convert assign_date to Date object
            minDate={new Date()}
            // error={errors?.assign_date || ''}
          />

          {/* <SelectBox
            label='Customer Name'
            options={customerList}
            value={formData?.customer_id}
            onChange={(e) => handleInputChange('customer_id', e)}
            error={errors?.customer_id || ''}
            disabled={isEdit}
          /> */}
          <div className=''>
            <label className='mb-1 block font-bold'>Customer Name</label>
            <Select
              key='select-box'
              isClearable={false}
              options={customerList}
              menuIsOpen={menuIsOpen}
              onMenuOpen={() => setMenuIsOpen(true)}
              onMenuClose={() => setMenuIsOpen(false)}
              onChange={(e: any) => handleInputChange('customer_id', e?.value)}
              disabled={isEdit}
            />
          </div>
          {isEdit && (
            <>
              <InputField
                type='text'
                disabled={isEdit} // Disable if not in edit mode
                label='Branch Name'
                value={formData?.branch_name}
              />
              <InputField
                type='text'
                label='Device Name'
                value={formData?.device_name}
                disabled={isEdit} // Disable if not in edit mode
              />
            </>
          )}
          {!isEdit && (
            <SelectBox
              label='Device Type'
              options={DEVICETYPE}
              value={deviceType}
              onChange={setDeviceType}
              error={errors?.deviceType || ''}
            />
          )}
          {deviceType &&
            (deviceType == NEWDEVICE ? (
              <div className='grid w-full grid-cols-3 gap-4'>
                <SelectBox
                  label='Installation Location'
                  options={branchList}
                  value={formData?.branch_id}
                  onChange={(e) => handleInputChange('branch_id', e)}
                  error={errors?.branch_id || ''}
                />
                <InputField
                  label='Device Location'
                  type={'text'}
                  value={formData?.location || ''}
                  onChange={(e) => handleInputChange('location', e)}
                  error={errors?.location || ''}
                />
                <MultiSelectDropdown
                  options={requestTypeList || []}
                  isMulti={false}
                  closeMenuOnSelect={true}
                  // value={formData?.request_type_id}
                  label='Complain Type'
                  getOptionValue={(option) => option?.id} // Pass getOptionValue function
                  getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
                  onChange={(e: any) =>
                    handleInputChange('request_type_id', e.id)
                  }
                  error={errors?.request_type_id || ''}
                />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4'>
                {/* <SelectBox
                  label='Device Name'
                  options={deviceList}
                  value={formData?.device_id}
                  onChange={(e) => handleInputChange('device_id', e)}
                  error={errors?.device_id || ''}
                /> */}
                <div>
                  <MultiSelectDropdown
                    options={deviceList || []}
                    isMulti={false}
                    closeMenuOnSelect={true}
                    // value={formData?.device_id}
                    label='Device Name'
                    getOptionValue={(option) => option?.id} // Pass getOptionValue function
                    getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
                    onChange={(e: any) => handleInputChange('device_id', e.id)}
                    error={errors?.device_id || ''}
                  />
                </div>
                <div>
                  <MultiSelectDropdown
                    options={requestTypeList || []}
                    isMulti={false}
                    closeMenuOnSelect={true}
                    // value={formData?.request_type_id}
                    label='Complain Type'
                    getOptionValue={(option) => option?.id} // Pass getOptionValue function
                    getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
                    onChange={(e: any) =>
                      handleInputChange('request_type_id', e.id)
                    }
                    error={errors?.request_type_id || ''}
                  />
                </div>
                {/* <SelectBox
                  label='Complain Type'
                  options={requestTypeList}
                  value={formData?.request_type_id}
                  onChange={(e) => handleInputChange('request_type_id', e)}
                  error={errors?.request_type_id || ''}
                /> */}
              </div>
            ))}

          <InputField
            type='number'
            label='Amount'
            value={formData?.initial_price || ''}
            onChange={(e) => handleInputChange('initial_price', e)}
            error={errors?.initial_price || ''}
            disabled={isEdit}
          />
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddNewComplaint;
