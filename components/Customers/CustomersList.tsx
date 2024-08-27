'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  IconAddLine,
  IconBxErrorCircle,
  IconDownload,
  IconEdit,
  IconLoading,
  IconSearch,
} from '@/utils/Icons';

import TableComponent from '@/components/Table';
import { Badge } from '@/components/ui/badge';
import { useMutation } from 'react-query';
import { apiCall, downloadFile } from '@/hooks/api';
import SearchInput from '@/components/SearchInput';
import { showToast } from '@/components/Toast';
import ROUTES, {
  CUSTOMER,
  HELPERSDATA,
  PARTNERS,
  deleteArrayItem,
  getAuthKeyFromBasePath,
  getBaseUrl,
  getVIPStatus,
  updateArray,
} from '@/utils/utils';
import AddCustomer from './AddCustomer';
import { DataContext } from '@/context/dataProvider';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ConfirmationDialog from '../ConfirmationDialog';
import AddBranch from './AddBranch';
import AddPartnerDialog from './AddPartnerDialog';
import CheckboxItem from '../CheckboxItem';
import Loader from '../Loader';
import MyDialog from '../MyDialog';
import { ScrollArea } from '../ui/scroll-area';
import AddWhatsAppDialog from './AddWhatsAppDialog';
import moment from 'moment';
import { useAccessRights } from '@/hooks/useAccessRights';

interface GetCustomersColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

interface UserTypes {
  [key: string]: any;
}

function CustomersList({ apiBaseUrl }: any) {
  // const [itemList, setitemList] = useState<UserTypes | undefined>();
  const apiAction = useMutation(apiCall);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredItemData, setfilteredItemData] = useState<UserTypes[]>([]);
  const [showModal, setshowModal] = useState(false);
  const [showBranchModal, setBranchshowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedItem, setselectedItem] = useState<UserTypes>();
  const { state, setData } = useContext(DataContext);
  const [helperData, setHelperData] = useState();
  const [loading, setLoading] = useState(false);
  const [isConfirmation, setConfirmation] = useState(false);
  const [selectedID, setselectedID] = useState<UserTypes>();
  const [addPartnerDialog, setAddPartnerDialog] = useState(false);
  const [searchInBranch, setsearchInBranch] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false); // Track whether search has been performed
  const [showGroupCustomerDialog, setGroupCustomerDialog] = useState(false);
  const [billingInfo, setBillingInfo] = useState<any>({});
  const [showWhatsAppModal, setWhatsAppModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>();

  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBenterPrise = basePath == ROUTES.PBENTERPRISE;
  const type = getAuthKeyFromBasePath(basePath);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const router = useRouter();
  const { isAccess } = useAccessRights();

  const searchCustomers = async () => {
    const searchInputValue = searchTerm.trim();
    if (!searchInputValue || searchInputValue.length < 3) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: 'Please enter minimum 3 character to search',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
      return; // Stop execution if no search term is entered
    }
    fetchCustomerRequest();
  };

  const fetchCustomerRequest = async () => {
    setFetchLoading(true);
    const searchInputValue = searchTerm.trim();
    try {
      const apiData = {
        endpoint: `${apiBaseUrl.CUSTOMERS}?search_in_branch=${
          searchInBranch ? 1 : 2
        }&search=${encodeURIComponent(searchInputValue)}&need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      setfilteredItemData(() => data);
      setSearchPerformed(true);
      // setitemList(data)
      // setsearchInBranch(false);
      // setSearchTerm('');
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setFetchLoading(true);
      const apiData = {
        endpoint: `${apiBaseUrl.CUSTOMERS}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      setfilteredItemData(() => data.data);
      // setitemList(data)
      setsearchInBranch(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setFetchLoading(false);
    }
  };

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

  useEffect(() => {
    if (isPBPartner) {
      const storedUserData = localStorage.getItem(`${type}_user_info`);
      if (storedUserData) {
        const formatedUser = JSON.parse(storedUserData);
        setSelectedPartner(formatedUser);
      }
    }

    if (isPBenterPrise && state?.[PARTNERS] == undefined) {
      fetchPartner();
    }
  }, []);

  useEffect(() => {
    if (isEnterprise) {
      fetchCustomerRequest();
    }
  }, []);

  const fetchPartner = async () => {
    try {
      const fetchPartner = {
        endpoint: `${apiBaseUrl.PARTNER_USER}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchPartner);
      if (data) {
        setData({ [PARTNERS]: data });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleSearchButtonClick = () => {
    searchCustomers(); // Call the searchCustomers function when the button is clicked
  };

  const handleAddCustomerClick = () => {
    setshowModal(true);
    setErrors({});
    setselectedItem({
      isNew: true,
    });
  };

  const handleInputChange = (key: string, value: string) => {
    // Update the form data state in the parent component
    setselectedItem((prevData) => ({
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

  const handleSave = async (itemList: UserTypes) => {
    try {
      // Start the loading state
      setLoading(true);
      const isEdit = selectedItem?.id;
      const data = new FormData();
      Object.keys(itemList).map((key) => {
        if (
          key == 'id' ||
          key == 'old_id' ||
          key == 'created_at' ||
          key == 'updated_at' ||
          key == 'deleted_at' ||
          key == 'country' ||
          key == 'state' ||
          key == 'city' ||
          key == 'allCity' ||
          key == 'allState' ||
          (key == 'device_id' && itemList[key] == null) ||
          (key == 'location_id' && itemList[key] == null) ||
          (key == 'node_id' && itemList[key] == null) ||
          (isEdit && key == 'email_1' && selectedItem[key] == null) ||
          (isEdit && key == 'email_2' && selectedItem[key] == null) ||
          (isEdit && key == 'phone_1' && selectedItem[key] == null) ||
          (isEdit && key == 'address_2' && selectedItem[key] == null) ||
          (isEdit && key == 'address_3' && selectedItem[key] == null) ||
          (isEdit && key == 'tan' && selectedItem[key] == null) ||
          (isEdit && key == 'pan' && selectedItem[key] == null) ||
          (isEdit && key == 'gst' && selectedItem[key] == null)
        )
          return;

        const value = itemList[key];

        data.append(key, value);
      });

      const valifationRules = [
        { field: 'name', value: selectedItem?.name, message: 'Name' },
        // {
        //   field: 'email',
        //   value: selectedItem?.email,
        //   message: 'Email',
        //   type: VALIDATIONTYPE.ISEMAIL,
        // },
        {
          field: 'phone',
          value: selectedItem?.phone,
          message: 'Contact No',
          type: VALIDATIONTYPE.ISPHONE,
        },
        {
          field: 'address_1',
          value: selectedItem?.address_1,
          message: 'Address 1',
        },
        {
          field: 'locality',
          value: selectedItem?.locality,
          message: 'Locality',
        },

        { field: 'state_id', value: selectedItem?.state_id, message: 'State' },
        { field: 'city_id', value: selectedItem?.city_id, message: 'City' },
        {
          field: 'zip',
          value: selectedItem?.zip,
          message: 'Zip',
          type: VALIDATIONTYPE.ISZIP,
        },
      ];

      // Add email_1 validation rule conditionally if it's not null
      if (
        selectedItem?.email !== null &&
        selectedItem?.email?.trim() !== '' &&
        selectedItem?.email !== undefined
      ) {
        valifationRules.push({
          field: 'email',
          value: selectedItem.email,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        });
      }

      if (
        selectedItem?.email_1 !== null &&
        selectedItem?.email_1?.trim() !== '' &&
        selectedItem?.email_1 !== undefined
      ) {
        valifationRules.push({
          field: 'email_1',
          value: selectedItem.email_1,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        });
      }

      if (
        selectedItem?.email_2 !== null &&
        selectedItem?.email_2?.trim() !== '' &&
        selectedItem?.email_2 !== undefined
      ) {
        valifationRules.push({
          field: 'email_2',
          value: selectedItem.email_2,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        });
      }

      let { isError, errors } = validateForm(valifationRules);
      if (isError) {
        setErrors(errors);
      } else {
        let apiUrl = apiBaseUrl.CUSTOMERS;

        const customer = {
          endpoint: apiUrl,
          method: 'POST',
          body: data,
          isFormData: true,
        };
        if (isEdit)
          customer.endpoint = `${customer.endpoint}/${selectedItem.id}?_method=patch`;
        const response = await apiAction.mutateAsync(customer);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setselectedItem({});
          setshowModal(false);

          if (isEdit) {
            // Get the current state of item list
            const currentItems = Array.isArray(filteredItemData)
              ? filteredItemData
              : [];

            // Find the index of the updated item in the state
            const updatedItemIndex = currentItems.findIndex(
              (item: any) => item.id === itemList.id
            );

            // Only update the item's data in the state if the item exists
            if (updatedItemIndex !== -1) {
              // Create a new copy of the currentItems array
              const updatedUsers = [...currentItems];

              // Update the specific item's data
              updatedUsers[updatedItemIndex] = {
                ...updatedUsers[updatedItemIndex],
                ...response.data,
              };

              // Set the updated item list to the state
              setfilteredItemData(updatedUsers);
            }
          } else {
            // fetchCustomers();
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

  const handleGroupClick = async (item: any) => {
    setGroupCustomerDialog(true);
    try {
      const fetchBillingGroup = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${item?.id}/billing-group`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBillingGroup);
      if (data) setBillingInfo(data);
      else setBillingInfo({});
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onCloseGroupCustomerDialog = () => {
    setselectedItem({});
    setGroupCustomerDialog(false);
  };

  const handleEditClick = (rowData: any) => {
    setselectedItem({
      ...rowData,
      allState: [{ ...rowData.state }],
      allCity: [{ ...rowData.city }],
    });
    setshowModal(true);
    setErrors({});
  };

  const handleDeleteClick = (item: any) => {
    setConfirmation(true);
    setselectedItem(item);
  };

  const handleDeleteConfirmationClick = async () => {
    setLoading(true);
    try {
      const deleteCustomer = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedItem?.id}`,
        method: 'DELETE',
      };

      const { data, isError } = await apiAction.mutateAsync(deleteCustomer);
      if (data) {
        // const tempCustomer = {
        //   data: deleteArrayItem(itemList?.data, selectedItem as any),
        // };
        // console.log(tempCustomer,'tempCustomer')
        // setfilteredItemData(tempCustomer);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setfilteredItemData([
        ...deleteArrayItem(filteredItemData, selectedItem!),
      ]);
      setselectedItem({});
      setConfirmation(false);
      setLoading(false);
    }
  };

  const handleSaveBranch = async (itemList: UserTypes) => {
    setselectedID({});
  };

  const handleAddBranchClick = (item: any) => {
    setBranchshowModal(true);
    setselectedID(item.id);
  };

  const handleAddWhatsAppClick = (item: any) => {
    setselectedItem(item);
    setWhatsAppModal(true);
  };

  const onCloseWhatsAppModal = () => {
    setselectedItem({});
    setWhatsAppModal(false);
  };

  const handleAddPartnerClick = (item: any) => {
    setData({ [CUSTOMER]: item });
    setAddPartnerDialog(true);
  };

  const handleAddPartnerSave = () => {
    // fetchCustomers();
    // setfilteredItemData([]);
    setAddPartnerDialog(false);
  };

  const handleExportDevicesClick = async (item: any) => {
    item.isLoading = true;
    setfilteredItemData([...updateArray(filteredItemData, item)]);
    try {
      let endpoint: string = `${apiBaseUrl.CUSTOMERS}/${item?.id}/export-devices-units`;

      const blob: Blob = await downloadFile(endpoint);

      const blobUrl: string = window.URL.createObjectURL(blob);

      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = `${item.name}_${moment(new Date()).format('Y-MM-DD')}.xlsx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      item.isLoading = false;
      setfilteredItemData([...updateArray(filteredItemData, item)]);
      setLoading(false);
    }
  };

  const columnsGroup: GetCustomersColumn[] = [
    {
      accessorKey: 'name',
      header: 'Cusomer Name',
      render: (item: any) => (
        <Link
          href={`${ROUTES.CUSTOMERS}/${item.id}`}
          className='flex font-bold text-blueButton-default'
          onClick={(e) => {
            e.preventDefault();
            setData({ [CUSTOMER]: item });
            router.push(`${ROUTES.CUSTOMERS}/${item.id}`);
          }}
        >
          {item.name}
        </Link>
      ),
    },
    { accessorKey: 'device_count', header: 'Number Of Devices' },
  ];

  const columns: GetCustomersColumn[] = [
    {
      accessorKey: 'is_vip',
      header: 'VIP',
      className: 'max-w-[50px]',
      render: (item: any) => (
        <span className='text-pbHeaderBlue'>{getVIPStatus(item?.is_vip)}</span>
      ),
    },
    {
      accessorKey: '',
      header: 'Type',
      className: 'max-w-[100px]',
      render: (item: any) => (
        <Badge variant={'secondary'}>{item.type || 'new'}</Badge>
      ),
    },
    { accessorKey: 'id', header: 'Customer ID', className: 'max-w-[150px]' },
    {
      accessorKey: 'name',
      header: 'Name',
      render: (item: any) => (
        <div>
          {isPBAdmin ? (
            <span className='font-bold'>{item?.name}</span>
          ) : (
            <div>
              <Link
                href={`${ROUTES.CUSTOMERS}/${item.id}`}
                className='flex font-bold text-blueButton-default'
                onClick={(e) => {
                  e.preventDefault();
                  setData({ [CUSTOMER]: item });
                  router.push(`${ROUTES.CUSTOMERS}/${item.id}`);
                }}
              >
                {item?.name}
              </Link>
              {item.billing_group_customer_count > 0 ? (
                <Button size='xs' onClick={() => handleGroupClick(item)}>
                  Group
                </Button>
              ) : null}
            </div>
          )}
          {item?.branch && (
            <div className='w-full py-2 font-bold'>
              <span>Branch:- </span>
              <span>{item?.branch[0]?.name}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'address_1',
      header: 'Address',
      render: (item: any) => (
        <div>
          <span className='block  '>
            {item?.address_1}
            {item?.address_2 ? ', ' + (item?.address_2 || '') : ''}{' '}
            {item?.address_3 ? ', ' + (item?.address_3 || '') : ''}{' '}
            {item?.city?.name}
          </span>
          {item?.branch && (
            <div className='w-full py-2 font-bold'>
              <span>Branch Address:- </span>
              <span>
                {' '}
                {item?.branch[0]?.address_1}
                {item?.branch[0]?.address_2
                  ? ',' + ' ' + item?.branch[0]?.address_3
                  : ''}{' '}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      className: 'max-w-[150px]',
      render: (item: any) => (
        <div>
          <span className='block  '>{item?.phone}</span>
          {item?.branch && (
            <div className='w-full py-2 font-bold'>
              <span>Branch Contact:- </span>
              <span> {item?.branch[0]?.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'City',
      className: 'max-w-[150px]',
      render: (item: any) => (
        <label className=' block'>{item?.city?.name}</label>
      ),
    },
  ];

  if (!isPBAdmin) {
    columns.push({
      accessorKey: 'Action',
      header: 'Action',
      className: 'min-w-[200px] ',
      render: (item: any) => (
        <div className='flex flex-wrap gap-3'>
          {(item.is_enterprise == 2 || isPBenterPrise) && (
            <>
              <Button
                size='xs'
                onClick={() => handleEditClick(item)}
                icon={<IconEdit />}
              >
                Edit
              </Button>
              {isPBenterPrise ? (
                <Button
                  size='xs'
                  onClick={() => handleAddPartnerClick(item)}
                  icon={<IconAddLine className='h-4 w-4' />}
                >
                  Partner
                </Button>
              ) : null}
              <Button
                size='xs'
                onClick={() => handleAddBranchClick(item)}
                icon={<IconAddLine className='h-4 w-4' />}
              >
                Branch
              </Button>
              {(selectedPartner?.partner?.is_subscribed_whatsapp === 1 ||
                isPBenterPrise) && (
                <Button
                  size='xs'
                  onClick={() => handleAddWhatsAppClick(item)}
                  icon={<IconAddLine className='h-4 w-4' />}
                >
                  WhatsApp Info
                </Button>
              )}
              {isAccess && (
                <Button
                  size='xs'
                  variant={'destructive'}
                  onClick={() => handleDeleteClick(item)}
                >
                  Delete
                </Button>
              )}
              <Button
                size='xs'
                onClick={() => handleExportDevicesClick(item)}
                disabled={item?.isLoading}
                icon={
                  item?.isLoading ? (
                    <IconLoading />
                  ) : (
                    <IconDownload className='h-4 w-4' />
                  )
                }
              >
                Export Devices
              </Button>
            </>
          )}
        </div>
      ),
    });
  }

  if (isPBAdmin) {
    columns.push({
      accessorKey: 'partner',
      header: 'Partner',
      className: 'min-w-[200px] max-w-[250px] ',
      render: (item: any) => <span>{item?.partner?.name}</span>,
    });
  }

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5 '>
        <Breadcrumb />

        <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-9'>
          <div className='grid grid-cols-12 items-center gap-4 lg:col-span-5'>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              className='col-span-9'
              placeholder='Name (Min 3 character) or Contact no (full) or EmailID or User Id'
              onSubmit={handleSearchButtonClick}
            />
            <div className='col-span-3 flex justify-center'>
              <CheckboxItem
                key='SearchInBranch'
                checked={searchInBranch} // Check if the current brand id is in the selectedBrandIds array
                onCheckedChange={(checked) => setsearchInBranch(checked)}
                ariaLabel='Search In Branch'
                id={`SearchInBranch`}
              />
            </div>
          </div>

          <div className='ml-auto flex gap-5 lg:col-span-4'>
            <Button
              variant={'blue'}
              className='!w-full'
              onClick={handleSearchButtonClick} // Call handleSearchButtonClick when the button is clicked
              icon={<IconSearch className='h-4 w-4 text-white' />}
            >
              Search Record
            </Button>

            {!isPBAdmin && !isEnterprise && (
              <Button
                variant={'secondary'}
                className='!w-full'
                onClick={handleAddCustomerClick} // Call the function provided by the parent
                icon={<IconAddLine className='h-5 w-5 text-white' />}
              >
                Add Customer
              </Button>
            )}
          </div>
        </div>
        <TableComponent
          columns={columns}
          data={filteredItemData}
          searchTerm={searchPerformed}
        />
        {showModal && (
          <AddCustomer
            open={!!selectedItem}
            selectedData={selectedItem}
            helperData={helperData}
            onSave={handleSave}
            formErrors={errors}
            loading={loading}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => setshowModal(false)} // Set onClose to a function that sets selectedRow to null
          />
        )}

        {showBranchModal && (
          <AddBranch
            open={!!selectedID}
            selectedCustomerID={selectedID}
            helperData={helperData}
            onSave={handleSaveBranch}
            apiBaseUrl={apiBaseUrl}
            onClose={() => setBranchshowModal(false)} // Set onClose to a function that sets selectedRow to null
          />
        )}

        <ConfirmationDialog
          isOpen={isConfirmation}
          onClose={() => {
            setConfirmation(false);
            setselectedItem({});
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
      </div>

      {addPartnerDialog && (
        <AddPartnerDialog
          open={addPartnerDialog}
          onSave={handleAddPartnerSave}
          apiBaseUrl={apiBaseUrl}
          onClose={() => setAddPartnerDialog(false)}
        />
      )}
      {fetchLoading ? <Loader /> : null}

      <MyDialog
        open={showGroupCustomerDialog}
        onClose={onCloseGroupCustomerDialog}
        title='Group Customer'
        ClassName='sm:max-w-[50%] h-full grow max-h-[60%]'
      >
        <ScrollArea className='grow'>
          <div className='flex grow flex-col p-4 '>
            <div className='flex py-5 '>
              <h1 className='text-lg font-medium leading-none tracking-tight'>
                Group Code: {billingInfo?.group_code}
              </h1>
            </div>
            <TableComponent
              columns={columnsGroup}
              data={billingInfo?.customers}
            />
          </div>
        </ScrollArea>
      </MyDialog>
      {showWhatsAppModal ? (
        <AddWhatsAppDialog
          open={showWhatsAppModal}
          apiBaseUrl={apiBaseUrl}
          onClose={onCloseWhatsAppModal}
          selectedItem={selectedItem}
        />
      ) : null}
    </div>
  );
}

export default CustomersList;
