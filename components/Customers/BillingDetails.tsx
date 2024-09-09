import React, { FC, useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import MyDialog from '../MyDialog';
import TableComponent from '../Table';
import {
  IconAddLine,
  IconBxErrorCircle,
  IconClockTimeThreeOutline,
  IconDeleteBinLine,
  IconLoading,
} from '@/utils/Icons';
import InputField from '../InputField';
import SelectAsync from '../SelectAsync';
import { OptionProps } from 'react-select';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import EditableField from '../EditableField';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import CheckboxItem from '../CheckboxItem';
import ROUTES, {
  CUSTOMER,
  TEXTAREA,
  deleteArrayItem,
  getBaseUrl,
} from '@/utils/utils';
import { useParams, usePathname } from 'next/navigation';
import { DataContext } from '@/context/dataProvider';
import { validateForm } from '@/utils/FormValidationRules';
import ConfirmationDialog from '../ConfirmationDialog';
import Loader from '../Loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showToast } from '../Toast';
import moment from 'moment';
import { Skeleton } from '../ui/skeleton';

interface CustomerColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}
interface BillingDetailsProps {
  apiBaseUrl?: FormData;
}
interface BillingProps {
  customers?: FormData[];
  group_code?: string;
  name?: string;
}

const BillingDetails: FC<BillingDetailsProps> = ({ apiBaseUrl }) => {
  const [showGroupCustomerDialog, setShowGroupCustomerDialog] = useState(false);
  const [isNewCustomer, setNewCustomer] = useState(false);
  const [customerList, setCustomerList] = useState<FormData[]>([]);
  const [isEditTaxInfo, setEditTaxInfo] = useState(false);
  const [taxFormData, setTaxFormData] = useState({
    gst: '',
    pan: '',
    tan: '',
  });
  const [groupForm, setGroupForm] = useState<FormData>({});
  const [errors, setErrors] = useState<FormData>({});
  const [customerInfo, setCustomerInfo] = useState<FormData>({});
  const [billingInfo, setBillingInfo] = useState<BillingProps>({});
  const [billingList, setBillingList] = useState<any>([]);
  const [isLoading, setLoading] = useState(false);
  const [billingLoading, setbillingLoading] = useState(false);
  const [isLoadingUpdate, setLoadingUpdate] = useState(false);
  const [isLoadingSend, setLoadingSend] = useState(false);
  const [isConfirmationDialogOpen, setConfrimationDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FormData | null>({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showLoader, setLoader] = useState(false);
  const { id } = useParams();
  const apiAction = useMutation(apiCall);
  const { state, setData } = useContext(DataContext);
  const pathName = usePathname();
  const basePath = getBaseUrl(pathName);
  const isPBEenterprise = basePath == ROUTES.PBENTERPRISE;
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const [selectedBillingIds, setSelectedBillingds] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [paymentReferences, setPaymentReferences] = useState<{
    [date: string]: string;
  }>({});

  useEffect(() => {
    // if (!isPBEenterprise) {
      fetchCustomer();
    // }
  }, []);

  useEffect(() => {
    if (state?.[CUSTOMER]) {
      const customer = state?.[CUSTOMER];
      setCustomerInfo(customer);
      setTaxFormData({
        gst: customer.gst,
        pan: customer.pan,
        tan: customer.tan,
      });
      if (!isPBPartner ||  customer?.is_enterprise == 2) {
        fetchGroups();
        fetchCustomerBilling();
      }
    }
  }, [state?.[CUSTOMER]]);

  const promiseOptions = (inputValue: string) =>
    new Promise<{ [Key: string]: any }[]>((resolve) => {
      resolve(filterCustomers(inputValue));
    });

  const filterCustomers = (inputValue: string) => {
    return customerList.filter((i) =>
      i.name.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const onGroupClick = () => {
    setShowGroupCustomerDialog(true);
  };

  const onCloseGroupCustomerDialog = () => {
    setShowGroupCustomerDialog(false);
  };

  const addNewCustomerClick = () => {
    setNewCustomer(true);
  };

  const onAddClick = async () => {
    const { customer_id } = groupForm;
    const valifationRules = [
      {
        field: 'customer_id',
        value: customer_id,
        message: 'Customer',
        customMessage: `Please select customer`,
      },
    ];

    let { isError, errors } = validateForm(valifationRules);
    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      try {
        const body = {
          customer_id,
          name: billingInfo?.group_code,
        };
        const postGroupCustomer = {
          endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/billing-group/add-customer`,
          method: 'POST',
          body,
        };
        const { data, isError, errors } =
          await apiAction.mutateAsync(postGroupCustomer);
        if (data) {
          setLoader(true);
          setGroupForm({});
          setNewCustomer(false);
          fetchCustomer();
          fetchGroups();
        }
        if (isError) {
          setErrors(errors);
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onDeleteClick = (item: FormData) => {
    setConfrimationDialog(true);
    setSelectedItem(item);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const deleteGroupCustomer = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/billing-group/customer/${selectedItem?.id}`,
        method: 'DELETE',
      };

      const { data } = await apiAction.mutateAsync(deleteGroupCustomer);
      if (data) {
        let tempBillingInfo = billingInfo as any;
        let tempCustomers = deleteArrayItem(
          tempBillingInfo?.customers,
          selectedItem as any
        );
        tempBillingInfo = {
          ...tempBillingInfo,
          customers: tempCustomers,
        };
        setLoader(true);
        setBillingInfo({ ...tempBillingInfo });
        setSelectedItem({});
        setConfrimationDialog(false);
        fetchCustomer();
        setNewCustomer(false);
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const fetchBillingGroup = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/billing-group`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBillingGroup);
      if (data) setBillingInfo(data);
      else setBillingInfo({});
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchCustomer = async () => {
    try {
      let fetchCustomers = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}?need_all=1&billing_customer_list=1`,
        method: 'GET',
      };

      if(isPBEenterprise){
        fetchCustomers.endpoint = `${fetchCustomers?.endpoint}&is_enterprise=1`;
      }

      const { data } = await apiAction.mutateAsync(fetchCustomers);
      if (data) setCustomerList(data);
      else setCustomerList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoader(false);
    }
  };

  const fetchCustomerBilling = async () => {
    setbillingLoading(true);
    try {
      const fetchCustomers = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/billing`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchCustomers);
      setBillingList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setbillingLoading(false);
    }
  };

  const sendReminder = async () => {
    if (selectedBillingIds.length === 0) {
      showToast({
        variant: 'destructive',
        message: 'Please select at least one checkbox.',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
      return;
    }
    try {
      setLoadingSend(true);
      const fetchCustomers = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/billing/send-reminder`,
        method: 'POST',
        body: {
          billing_id: selectedBillingIds,
        },
      };

      const { data } = await apiAction.mutateAsync(fetchCustomers);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setSelectedBillingds([]); // Otherwise, clear selected complaints
      setSelectAllChecked(false);
      setLoadingSend(false);
    }
  };

  const updatePaymentReference = async (date: any) => {
    const paymentReference = paymentReferences[date] || '';

    if (selectedBillingIds.length === 0) {
      showToast({
        variant: 'destructive',
        message: 'Please select at least one checkbox.',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
      return;
    }
    if (!paymentReference.trim()) {
      showToast({
        variant: 'destructive',
        message: 'Please enter a payment reference.',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
      return;
    }
    setLoadingUpdate(true);
    try {
      const fetchCustomers = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/billing/payment-reference`,
        method: 'POST',
        body: {
          billing_id: selectedBillingIds,
          payment_reference: paymentReference,
        },
      };

      const { data } = await apiAction.mutateAsync(fetchCustomers);
      if (data) {
        fetchCustomerBilling();
      }
      // setBillingList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setSelectAllChecked(false);
      setSelectedBillingds([]); // Otherwise, clear selected complaints
      setPaymentReferences({});
      setLoadingUpdate(false);
    }
  };

  const onTaxSave = async () => {
    const { gst, pan, tan } = taxFormData;

    const valifationRules = [
      { field: 'gst', value: gst, message: 'GST' },
      { field: 'pan', value: pan, message: 'PAN' },
      { field: 'tan', value: tan, message: 'TAN' },
    ];

    let { isError, errors } = validateForm(valifationRules);
    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      try {
        const updateCustomer = {
          endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}`,
          method: 'PATCH',
          body: taxFormData,
        };

        const { data } = await apiAction.mutateAsync(updateCustomer);
        if (data) {
          setData({ [CUSTOMER]: data });
          setEditTaxInfo(false);
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onEditTaxInfo = () => {
    setEditTaxInfo(true);
  };

  const onCancelTaxInfo = () => {
    setEditTaxInfo(false);
    setTaxFormData({
      gst: customerInfo?.gst,
      pan: customerInfo?.pan,
      tan: customerInfo?.tan,
    });
  };

  const onTaxChangeHandler = (field: string, value: string) => {
    setTaxFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeviceSelect = (billingId: string) => {
    // Check if the technician ID is already selected
    const index = selectedBillingIds.indexOf(billingId);
    if (index !== -1) {
      // Technician is already selected, remove from the array
      setSelectedBillingds((prevIds) =>
        prevIds.filter((id) => id !== billingId)
      );
    } else {
      // Technician is not selected, add to the array
      setSelectedBillingds((prevIds) => [...prevIds, billingId]);
    }
  };

  const handleSelectAllChange = (date: string) => {
    // Calculate the number of enabled checkboxes
    const enabledCount = billingList[date].filter(
      (billingInfo: any) => !billingInfo.payment_reference
    ).length;

    // If all checkboxes are disabled, return early
    if (enabledCount === 0) {
      return;
    }

    const checked = !selectAllChecked;
    setSelectAllChecked(checked);

    // If "Select All" is checked, select all enabled checkboxes
    if (checked) {
      const deviceIdsForDate = billingList[date]
        .filter((billingInfo: any) => !billingInfo.payment_reference)
        .map((billingInfo: any) => billingInfo.id);
      setSelectedBillingds(deviceIdsForDate);
    } else {
      setSelectedBillingds([]); // Otherwise, clear selected complaints
    }
  };

  const handlePaymentReferenceChange = (date: string, value: string) => {
    setPaymentReferences((prev) => ({
      ...prev,
      [date]: value,
    }));
  };

  const columns: CustomerColumn[] = [
    { accessorKey: 'name', header: 'Cusomer Name' },
    { accessorKey: 'device_count', header: 'Number Of Devices' },
    {
      accessorKey: 'action',
      header: '',
      render: (item: any) =>
        item?.is_parent == 2 ? (
          <Button
            size={'sm'}
            variant='destructive'
            icon={<IconDeleteBinLine />}
            onClick={() => onDeleteClick(item)}
          >
            Delete
          </Button>
        ) : null,
    },
  ];

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <div className='grid w-full grid-cols-3 gap-1 rounded-md bg-white p-5'>
          <div className='col-span-2 grid grid-cols-1'>
            <span className='font-semibold'>Billing Address</span>
            <span className='font-semibold'>{customerInfo?.name}</span>
            <span className='font-semibold'>{`${customerInfo?.address_1}${
              customerInfo?.address_2 ? ', ' + customerInfo?.address_2 : ''
            }${customerInfo?.address_3 ? ', ' + customerInfo?.address_3 : ''}${
              customerInfo?.city ? ', ' + customerInfo?.city?.name : ''
            }${customerInfo?.state ? ', ' + customerInfo?.state?.name : ''}${
              customerInfo?.zip ? '-' + customerInfo?.zip : ''
            }
            `}</span>
          </div>
          <div className='ml-auto'>
            {!isPBPartner || customerInfo?.is_enterprise == 2 ? (
              <Button size={'sm'} onClick={onGroupClick}>
                Group
              </Button>
            ) : null}
          </div>
        </div>
        <div className='grid grid-cols-5 gap-4'>
          <div>
            <EditableField
              label='GST:'
              value={taxFormData?.gst}
              editMode={isEditTaxInfo}
              onChange={(text) => onTaxChangeHandler('gst', text)}
              error={errors?.gst}
            />
          </div>
          <div>
            <EditableField
              label='PAN:'
              value={taxFormData?.pan}
              editMode={isEditTaxInfo}
              onChange={(text) => onTaxChangeHandler('pan', text)}
              error={errors?.pan}
            />
          </div>
          <div>
            <EditableField
              label='TAN:'
              value={taxFormData?.tan}
              editMode={isEditTaxInfo}
              onChange={(text) => onTaxChangeHandler('tan', text)}
              error={errors?.tan}
            />
          </div>
          <div className='flex items-center'>
            {(!isPBPartner || customerInfo?.is_enterprise == 2) && isEditTaxInfo ? (
              <div className='grid  grid-cols-2 gap-3'>
                <Button
                  size={'sm'}
                  onClick={onTaxSave}
                  icon={isLoading ? <IconLoading /> : null}
                >
                  Save
                </Button>
                <Button
                  size={'sm'}
                  variant={'destructive'}
                  onClick={onCancelTaxInfo}
                >
                  Cancel
                </Button>
              </div>
            ) : isPBEenterprise || customerInfo?.is_enterprise == 2 ? (
              <Button size={'sm'} onClick={onEditTaxInfo}>
                Edit
              </Button>
            ) : null}
          </div>
        </div>
        {/* <ScrollArea className='grow'> */}
          <Accordion type='single' collapsible className='flex flex-col gap-5'>
            {billingLoading ? (
              <>
                {Array.from({ length: 5 }, (_, index) => (
                  <>
                    <Skeleton key={index} className='min-h-[56px] w-full' />{' '}
                  </>
                ))}
              </>
            ) : (
              <>
                {Object?.keys(billingList || {})?.map(
                  (date: any, index: number) => (
                    <AccordionItem
                      key={date}
                      value={`main-item-${date}`}
                      className='rounded-md border-none bg-white px-4 no-underline'
                    >
                      <AccordionTrigger className='text-left hover:no-underline'>
                        <div className='grid w-full grid-cols-3 items-center justify-between  '>
                          <div className='flex items-center gap-5 capitalize'>
                            <div className='flex flex-col'>
                              <div className='text-sm font-bold'>
                                {moment(date).format('Do MMMM, YYYY')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='flex flex-col gap-4'>
                        <div className='grid grid-cols-4 text-sm font-bold'>
                          <CheckboxItem
                            ariaLabel='Select All'
                            id='Select All'
                            checked={selectAllChecked}
                            onCheckedChange={(checked) =>
                              handleSelectAllChange(date)
                            }
                          />

                          <span>Device Name</span>
                          <span>Amount</span>
                          <span>Payment Detail</span>
                          {/* <span>Payment Type</span> */}
                        </div>
                        {billingList[date]?.map((billingInfo: any) => (
                          <div
                            className='grid grid-cols-4'
                            key={billingInfo.id}
                          >
                            <CheckboxItem
                              ariaLabel=''
                              checked={selectedBillingIds.includes(
                                billingInfo.id
                              )}
                              disabled={
                                billingInfo.payment_reference != null
                                  ? true
                                  : false
                              }
                              onCheckedChange={() =>
                                handleDeviceSelect(billingInfo.id)
                              }
                              id={`device_${billingInfo?.id}`}
                            />

                            <span>{billingInfo?.device?.name}</span>
                            <span>
                              {billingInfo?.billing_amount ? (
                                <>
                                  <span className='font-bold'>INR</span>{' '}
                                  {billingInfo?.billing_amount}
                                </>
                              ) : (
                                '-'
                              )}
                            </span>
                            <span>{billingInfo?.payment_reference}</span>
                            {/* <span>
                              {billingInfo?.payment_mode ? (
                                <>{billingInfo?.payment_mode}</>
                              ) : (
                                <>-</>
                              )}
                            </span> */}
                          </div>
                        ))}
                        <div className='grid grid-cols-5 items-end gap-4'>
                          <div className='col-span-2'>
                            <InputField
                              type={TEXTAREA}
                              value={paymentReferences[date] || ''} // Use paymentReferences state for this date
                              placeholder='Enter Reference'
                              onChange={(e) =>
                                handlePaymentReferenceChange(date, e)
                              } // Pass index and value
                            />
                          </div>
                          <div className='col-span-2 flex items-center'>
                            <Button
                              size={'sm'}
                              icon={isLoadingUpdate ? <IconLoading /> : null}
                              disabled={isLoadingUpdate}
                              onClick={() => updatePaymentReference(date)}
                            >
                              Update
                            </Button>
                            <Button
                              className='ml-4'
                              size={'sm'}
                              disabled={isLoadingSend}
                              variant={'destructive'}
                              icon={
                                isLoadingSend ? (
                                  <IconLoading />
                                ) : (
                                  <IconClockTimeThreeOutline className='h-4 w-4 text-white' />
                                )
                              }
                              onClick={sendReminder}
                            >
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </>
            )}
          </Accordion>
        {/* </ScrollArea> */}
      </div>

      <MyDialog
        open={showGroupCustomerDialog}
        onClose={onCloseGroupCustomerDialog}
        title='Group Customer'
        ClassName='sm:max-w-[50%] h-full grow max-h-[60%] overflow-auto'
      >
        {/* <ScrollArea className='grow'> */}
        <div className='flex grow flex-col p-4 '>
          <div className='flex py-5 '>
            <h1 className='text-lg font-medium leading-none tracking-tight'>
              Group Code: {billingInfo?.group_code}
            </h1>
          </div>
          <TableComponent columns={columns} data={billingInfo?.customers} />
          <div className='py-4'>
            <Button
              size={'sm'}
              icon={<IconAddLine />}
              onClick={addNewCustomerClick}
            >
              Add New Customer
            </Button>
            {isNewCustomer ? (
              <div className='flex gap-4 pt-5'>
                <div className=' flex flex-col'>
                  <SelectAsync
                    loadOptions={promiseOptions}
                    getOptionLabel={(x: any) => x.name}
                    onChange={(customer: FormData) => {
                      setGroupForm({ customer_id: customer?.id });
                      setErrors((pre) => ({ ...pre, customer_id: '' }));
                    }}
                    error={errors?.customer_id}
                  />
                </div>
                <Button
                  size={'sm'}
                  onClick={onAddClick}
                  icon={isLoading ? <IconLoading /> : null}
                >
                  Add
                </Button>
              </div>
            ) : null}
          </div>
          {showLoader ? (
            <div className='fixed bottom-0 left-0 right-0 top-0 flex h-full w-full items-center justify-center bg-black/[.4]'>
              <IconLoading />
            </div>
          ) : null}
        </div>
        {/* </ScrollArea> */}
      </MyDialog>
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => {
          setConfrimationDialog(false);
          setSelectedItem(null);
        }}
        buttons={[
          {
            text: 'Delete',
            variant: 'destructive',
            size: 'sm',
            onClick: handleDelete,
            btnLoading: deleteLoading,
            icon: deleteLoading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        Do You Really Want to Delete This Record?
      </ConfirmationDialog>
    </div>
  );
};

export default BillingDetails;
