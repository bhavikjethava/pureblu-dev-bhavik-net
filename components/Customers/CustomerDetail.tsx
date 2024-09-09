'use client';
import { useContext, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { DataContext } from '@/context/dataProvider';
import CheckboxItem from '../CheckboxItem';
import { Button } from '../ui/button';
import ConfirmationDialog from '../ConfirmationDialog';
import {
  IconBxErrorCircle,
  IconLoading,
  IconPencil,
  IconStar,
} from '@/utils/Icons';
import { showToast } from '../Toast';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import ROUTES, {
  BRANCHLIST,
  CITY,
  CUSTOMER,
  DEVICELIST,
  HELPERSDATA,
  REFRESHBRANCHLIST,
  REFRESHDIVELIST,
  STATE,
  getBaseUrl,
} from '@/utils/utils';
import ListGroup from '../ListGroup';
import ListGroupItem from '../ListGroupItem';
import EditableField from '../EditableField';
import AddressField from '../AddressEditableField';
import { isRequired } from '@/utils/ValidationUtils';
import AmcDetails from './AmcDetails';
import TabsComponent from '../TabsComponent';
import Complaints from './Complaints';
import UnitDetails from './UnitDetails';
import BillingDetails from './BillingDetails';
import BranchList from './BranchList';
import AddNote from '../Note/AddNote';
import AddComplaint from '../Complaint/AddComplaint';
import { useParams, usePathname } from 'next/navigation';

export type Customers = {
  id: string;
  Name: string;
  Contact: string;
  button: any;
};

interface FormData {
  [key: string]: any;
}
let customerData: FormData;

const CustomerDetail = ({ id, apiBaseUrl }: any) => {
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormData>();
  const [helperData, setHelperData] = useState<{ data?: any }>({});
  const { state, setData } = useContext(DataContext);
  const [selectedformData, setselectedFormData] = useState<FormData>(
    state?.customer
  );
  const [selectedStatus, setselectedStatus] = useState<FormData>(customerData);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const { stateList, cityList, setStateList, setCityList, fetchRequest } =
    useStateCity();
  const [showComplainDialog, setComplainDialog] = useState(false);
  const [requestTypeList, setRequestTypeList] = useState<Array<FormData>>([]);

  // const [customer, setCustomer] = useState(state?.customer || {});
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isPBenterPrise = basePath == ROUTES.PBENTERPRISE;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  useEffect(() => {
    // if (state?.customer?.id != params?.id) {
    fetchCustomersDetail();
    // } else {
    // customerData = state?.customer;
    // }
    if (state.customer) {
      fetchRequest(STATE, state.customer.country_id);
      fetchRequest(CITY, state.customer.state_id);
    }
    fetchRequestType();
  }, []);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      const data = state[HELPERSDATA]; // Access state[HELPERSDATA] directly
      setHelperData((pre: any) => {
        return {
          ...pre,
          data: data, // Assign data directly, avoiding 'never' type
        };
      });
    }
  }, [state?.[HELPERSDATA]]);

  useEffect(() => {
    fetchBranches();
  }, [state?.[REFRESHBRANCHLIST]]);

  useEffect(() => {
    fetchDevices();
  }, [state?.[REFRESHDIVELIST]]);

  const fetchBranches = async () => {
    try {
      const fetchBranch = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/branch?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBranch);
      setData({ [BRANCHLIST]: data });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const fetchDevice = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/device?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchDevice);
      setData({ [DEVICELIST]: data });
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

  const fetchCustomersDetail = async () => {
    try {
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setselectedFormData(response?.data || {});
      customerData = response?.data;
      setData({ [CUSTOMER]: response?.data });

      fetchRequest(STATE, customerData.country_id);
      fetchRequest(CITY, customerData.state_id);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
    setErrors((pre) => {
      return {
        ...pre,
        [key]: '',
      };
    });
  };

  const handleCountryChange = (key: string, value: number) => {
    setStateList([]);
    setCityList([]);
    setselectedFormData((prevData) => ({ ...prevData, state_id: -1 }));
    setselectedFormData((prevData) => ({ ...prevData, city_id: -1 }));
    fetchRequest(STATE, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
    if (isRequired(value)) {
      setErrors((pre) => {
        return {
          ...pre,
          [key]: '',
        };
      });
    }
  };

  const handleStateChange = (key: string, value: number) => {
    setCityList([]);
    setselectedFormData((prevData) => ({ ...prevData, city_id: -1 }));
    fetchRequest(CITY, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
    if (isRequired(value)) {
      setErrors((pre) => {
        return {
          ...pre,
          [key]: '',
        };
      });
    }
  };

  const handleCheckboxChange = (key: string, value: any) => {
    setselectedStatus(() => ({ [key]: value }));
    setConfirmationDialogOpen(true);
  };

  const onChangeStatus = async () => {
    try {
      // Start the loading state
      setLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedformData?.id}`,
        method: 'PATCH',
        body: selectedStatus,
      };
      const response = await apiAction.mutateAsync(data);
      if (response?.isError) {
        setErrors(response.errors);
      } else {
        setErrors({});
        setConfirmationDialogOpen(false);
        setselectedFormData(response.data);
      }
      // }
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

  const onSave = async () => {
    try {
      // Start the loading state
      setLoading(true);

      const valifationRules = [
        {
          field: 'name',
          value: selectedformData?.name,
          message: 'Name',
        },
        {
          field: 'email',
          value: selectedformData?.email,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        },
        {
          field: 'phone',
          value: selectedformData?.phone,
          message: 'Mobile No.',
          type: VALIDATIONTYPE.ISPHONE,
        },
        {
          field: 'address_1',
          value: selectedformData?.address_1,
          message: 'Address 1',
        },
        {
          field: 'state_id',
          value: selectedformData?.state_id,
          message: 'State',
        },
        { field: 'city_id', value: selectedformData?.city_id, message: 'City' },
        {
          field: 'zip',
          value: selectedformData?.zip,
          message: 'Zip',
          type: VALIDATIONTYPE.ISZIP,
        },
      ];

      let { isError, errors } = validateForm(valifationRules);
      if (isError) {
        setErrors(errors);
      } else {
        const data = {
          endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedformData?.id}`,
          method: 'PATCH',
          body: selectedformData,
        };
        const response = await apiAction.mutateAsync(data);

        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setEditMode(false);
          setselectedFormData(response.data);
          setData({ [CUSTOMER]: response.data });
          // fetchCustomersDetail();
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

  const handleEditClick = () => {
    if (editMode) {
      setselectedFormData(state.customer);
    }
    setEditMode(!editMode);
    setErrors({});
  };

  const tabData = [
    {
      title: 'AMC Details',
      content: (
        <AmcDetails apiBaseUrl={apiBaseUrl} customerData={selectedformData} />
      ),
    },
    {
      title: 'Complaints',
      content: <Complaints id={id} apiBaseUrl={apiBaseUrl} />,
    },
    {
      title: 'Unit Details',
      content: <UnitDetails apiBaseUrl={apiBaseUrl} />,
    },
  ];

  if (!isEnterprise && !(isPBPartner && customerData?.is_enterprise == 1)) {
    tabData.push({
      title: 'Billing Details',
      content: <BillingDetails apiBaseUrl={apiBaseUrl} />,
    });
  }

  const handleAddBranch = async (itemList: FormData) => {};

  const onCloseNoteModal = () => {
    setShowNoteModal(false);
  };

  const onRequestComplain = () => {
    setComplainDialog(true);
  };

  const onCloseComplaintDialog = () => {
    setComplainDialog(false);
  };

  return (
    <div className='flex  flex-col md:flex-row'>
      <div className='w-full sticky top-0 z-30 flex-none h-screen overflow-auto  rounded-sm bg-white py-5 pl-5 pr-1 text-base shadow-2xl md:w-[300px]'>
        <div className='  flex h-full grow flex-col'>
          <div className='mb-3 pr-4'>
            <Button
              className=''
              variant={'outline'}
              size={'sm'}
              onClick={onRequestComplain}
            >
              Request New Complaint
            </Button>
          </div>
          <ScrollArea className='pr-4'>
            {!editMode &&
              (state?.[CUSTOMER]?.is_enterprise === 2 || isPBenterPrise) && (
                <Button
                  variant={'link'}
                  className='absolute right-5 top-5 h-auto p-0'
                  onClick={handleEditClick}
                >
                  <IconPencil className='h-5 w-5' />
                </Button>
              )}
            <ListGroup>
              <ListGroupItem
                label='Customer ID'
                value={`PBCUS-${selectedformData?.id}`}
                loading={!selectedformData} // Add loading prop here
              />
              <ListGroupItem className=''>
                <EditableField
                  label='Customer Name'
                  value={selectedformData?.name || ''}
                  editMode={editMode}
                  onChange={(value) => handleInputChange('name', value)}
                  error={errors?.name}
                  loading={!selectedformData} // Add loading prop here
                  labelClass='uppercase'
                />
              </ListGroupItem>
              <ListGroupItem className=''>
                <EditableField
                  label='Contact Number'
                  value={selectedformData?.phone || ''}
                  editMode={editMode}
                  onChange={(value) => handleInputChange('phone', value)}
                  error={errors?.phone}
                  loading={!selectedformData} // Add loading prop here
                  labelClass='uppercase'
                />
                {selectedformData?.phone_1 &&
                <EditableField
                  label=''
                  value={selectedformData?.phone_1 || ''}
                  editMode={editMode}
                  onChange={(value) => handleInputChange('phone_1', value)}
                  error={errors?.phone_1}
                  loading={!selectedformData} // Add loading prop here
                  labelClass='uppercase'
                />
                }
              </ListGroupItem>
              <ListGroupItem className=''>
                <EditableField
                  label='Email'
                  value={selectedformData?.email || ''}
                  editMode={editMode}
                  onChange={(value) => handleInputChange('email', value)}
                  error={errors?.email}
                  loading={!selectedformData} // Add loading prop here
                  labelClass='uppercase'
                />
                <EditableField
                  label=''
                  value={selectedformData?.email_1 || ''}
                  editMode={editMode}
                  onChange={(value) => handleInputChange('email_1', value)}
                  error={errors?.email_1}
                  loading={!selectedformData} // Add loading prop here
                  labelClass='uppercase'
                />
                <EditableField
                  label=''
                  value={selectedformData?.email_2 || ''}
                  editMode={editMode}
                  onChange={(value) => handleInputChange('email_2', value)}
                  error={errors?.email_2}
                  loading={!selectedformData} // Add loading prop here
                  labelClass='uppercase'
                />
              </ListGroupItem>
              <ListGroupItem className=''>
                <AddressField
                  label='Address'
                  editMode={editMode}
                  selectedformData={selectedformData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  // handleCountryChange={handleCountryChange} // Implement these functions
                  handleStateChange={handleStateChange} // Implement these functions
                  cityList={cityList} // Provide appropriate data
                  loading={!selectedformData} // Add loading prop here
                />
              </ListGroupItem>
              {editMode && (
                <ListGroupItem className=''>
                  <div className='flex gap-4'>
                    <Button
                      className='w-full'
                      onClick={onSave}
                      icon={isLoading ? <IconLoading /> : ''}
                      disabled={isLoading}
                      size={'sm'}
                    >
                      Save
                    </Button>
                    <Button
                      className='w-full'
                      variant={'outline'}
                      onClick={handleEditClick}
                      size={'sm'}
                    >
                      cancel
                    </Button>
                  </div>
                </ListGroupItem>
              )}
              {!isEnterprise && (isPBenterPrise || customerData?.is_enterprise == 2) && (
                <>
                  <ListGroupItem className='gap-3 !py-3'>
                    <CheckboxItem
                      checked={
                        selectedformData?.is_first_service_first_month === 1
                      }
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          'is_first_service_first_month',
                          checked ? 1 : 2
                        )
                      }
                      ariaLabel='First Service First Month'
                      id='is_first_service_first_month'
                    />
                    <CheckboxItem
                      checked={selectedformData?.is_signature_required === 1}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          'is_signature_required',
                          checked ? 1 : 2
                        )
                      }
                      ariaLabel='Required Signature'
                      id='is_signature_required'
                    />
                    <CheckboxItem
                      checked={selectedformData?.is_batch_report === 1}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('is_batch_report', checked ? 1 : 2)
                      }
                      ariaLabel='Batch Report'
                      id='is_batch_report'
                    />
                  </ListGroupItem>
                  <ListGroupItem className=''>
                    <div className={`flex items-center space-x-2 `}>
                      <label
                        htmlFor={'is_vip'}
                        className={`cursor-pointer ${
                          selectedformData?.is_vip === 1
                            ? 'text-pbHeaderBlue'
                            : ' text-pbGray'
                        }`}
                      >
                        <IconStar className='h-6 w-6' />
                      </label>
                      <label
                        htmlFor={'is_vip'}
                        className='cursor-pointer text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Mark as VIP
                      </label>
                      <div className='absolute h-0 w-0 overflow-hidden opacity-0'>
                        <CheckboxItem
                          checked={selectedformData?.is_vip == 1}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange('is_vip', checked ? 1 : 2)
                          }
                          ariaLabel='Mark as VIP'
                          id='is_vip'
                        />
                      </div>
                    </div>
                  </ListGroupItem>
                </>
              )}
              <ListGroupItem className='gap-2 '>
                {selectedformData?.id ? (
                  <Button
                    className=''
                    variant={'outline'}
                    size={'sm'}
                    onClick={() => setShowModal(true)}
                  >
                    Installation Locations
                  </Button>
                ) : null}
                {selectedformData?.id ? (
                  <Button
                    className=''
                    variant={'outline'}
                    size={'sm'}
                    onClick={() => setShowNoteModal(true)}
                  >
                    Note
                  </Button>
                ) : null}
              </ListGroupItem>
            </ListGroup>
          </ScrollArea>

          {showModal && (
            <BranchList
              open={!!showModal}
              apiBaseUrl={apiBaseUrl}
              selectedData={selectedformData}
              onAddBranch={handleAddBranch}
              onClose={() => setShowModal(false)}
            />
          )}
          <ConfirmationDialog
            isOpen={isConfirmationDialogOpen}
            onClose={() => {
              setConfirmationDialogOpen(false);
            }}
            buttons={[
              {
                text: 'Yes',
                variant: 'destructive',
                size: 'sm',
                onClick: onChangeStatus,
                btnLoading: isLoading,
                icon: isLoading ? <IconLoading /> : '',
              },
            ]}
            ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
          >
            Do You Really Want to Update This Record
          </ConfirmationDialog>
          {showNoteModal && (
            <AddNote
              apiBaseUrl={apiBaseUrl}
              isShow={showNoteModal}
              onClose={onCloseNoteModal}
            />
          )}
        </div>
      </div>
      <TabsComponent tabData={tabData} />
      {showComplainDialog && (
        <AddComplaint
          isShow={showComplainDialog}
          onClose={onCloseComplaintDialog}
          customer={selectedformData}
          requestTypeList={requestTypeList}
          apiBaseUrl={apiBaseUrl}
        />
      )}
    </div>
  );
};

export default CustomerDetail;
