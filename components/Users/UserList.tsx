'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconAddLine,
  IconBxErrorCircle,
  IconEdit,
  IconLoading,
  IconMinus,
} from '@/utils/Icons';
import AddAdmin from './AddAdmin';

import TableComponent from '@/components/Table';
import { apiCall } from '@/hooks/api'; // Adjust the path accordingly
import ROUTES, {
  HELPERSDATA,
  getBaseUrl,
  getStatusString,
} from '@/utils/utils';
import SearchInput from '@/components/SearchInput';
import { showToast } from '@/components/Toast';
import { useMutation } from 'react-query';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { DataContext } from '@/context/dataProvider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { isRequired } from '@/utils/ValidationUtils';

interface UsersColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface UserTypes {
  [key: string]: any;
}

function UserList({ apiBaseUrl }: any) {
  const [selectedUser, setSelectedUser] = useState<UserTypes>();
  const [filteredUserData, setFilteredUserData] = useState<UserTypes>();
  const [userList, setUserList] = useState<UserTypes | undefined>();
  const [helperData, setHelperData] = useState();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);
  const apiAction = useMutation(apiCall);
  const { state } = useContext(DataContext);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      setHelperData(state?.[HELPERSDATA]);
    }
  }, [state?.[HELPERSDATA]]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter data based on the search term
    const filteredUserData = userList?.data?.filter((item: any) => {
      return Object.values(item as { [key: string]: unknown }).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setFilteredUserData(filteredUserData);
  }, [searchTerm, userList]); // Add searchTerm and userList as dependencies

  const fetchUsers = async () => {
    try {
      const data = {
        endpoint: `${apiBaseUrl.ADMINS_USER}?need_all=1`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setUserList(() => ({
        ...response,
      }));
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleEditClick = (rowData: any) => {
    setSelectedUser({
      ...rowData,
      allState: [{ ...rowData.state }],
      allCity: [{ ...rowData.city }],
      role_id: rowData.roles[0]?.id,
      country_id: rowData.country_id,
    });
    setShowAddUserModal(true);
    setErrors({});
  };

  const handleActivateClick = async (item: any) => {
    const params = {
      is_active: 1,
    };

    const data = {
      endpoint: `${apiBaseUrl.ADMINS_USER}/${selectedUser?.id}`,
      method: 'PATCH',
      body: params,
    };

    try {
      setLoading(true);
      const response = await apiAction.mutateAsync(data);
      // Get the current state of user list
      const currentUsers = Array.isArray(filteredUserData)
        ? filteredUserData
        : [];

      // Find the index of the updated user in the state
      const updatedUserIndex = currentUsers.findIndex(
        (user: any) => user.id === selectedUser?.id
      );

      // Only update the user's data in the state if the user exists
      if (updatedUserIndex !== -1) {
        // Create a new copy of the currentUsers array
        const updatedUsers = [...currentUsers];

        // Update the specific user's data
        updatedUsers[updatedUserIndex] = {
          ...updatedUsers[updatedUserIndex],
          ...response.data,
        };

        // Set the updated user list to the state
        setFilteredUserData(updatedUsers);
      } else {
        console.error('User not found:', selectedUser?.id);
      }
    } catch (error) {
      // Handle error, if any
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
      setConfirmationDialog(false);
      setSelectedUser({});
    }
  };

  const handleDeActivateClick = async (item: any) => {
    const params = {
      is_active: 2,
    };

    const data = {
      endpoint: `${apiBaseUrl.ADMINS_USER}/${selectedUser?.id}`,
      method: 'PATCH',
      body: params,
    };

    try {
      setLoading(true);
      const response = await apiAction.mutateAsync(data);
      // Get the current state of user list
      const currentUsers = Array.isArray(filteredUserData)
        ? filteredUserData
        : [];

      // Find the index of the updated user in the state
      const updatedUserIndex = currentUsers.findIndex(
        (user: any) => user.id === selectedUser?.id
      );

      // Only update the user's data in the state if the user exists
      if (updatedUserIndex !== -1) {
        // Create a new copy of the currentUsers array
        const updatedUsers = [...currentUsers];

        // Update the specific user's data
        updatedUsers[updatedUserIndex] = {
          ...updatedUsers[updatedUserIndex],
          ...response.data,
        };

        // Set the updated user list to the state
        setFilteredUserData(updatedUsers);
      } else {
        console.error('User not found:', item.id);
      }
    } catch (error) {
      // Handle error, if any
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
      setConfirmationDialog(false);
      setSelectedUser({});
    }
  };

  const handleSave = async (userList: UserTypes) => {
    try {
      // Start the loading state
      setLoading(true);
      const isEdit = selectedUser?.id;

      const valifationRules = [
        {
          field: 'email',
          value: selectedUser?.email,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        },
        {
          field: 'phone',
          value: selectedUser?.phone,
          message: 'Mobile No.',
          type: VALIDATIONTYPE.ISPHONE,
        },
        {
          field: 'address_1',
          value: selectedUser?.address_1,
          message: 'Address 1',
        },
        {
          field: 'address_2',
          value: selectedUser?.address_2,
          message: 'Address 2',
        },
        {
          field: 'locality',
          value: selectedUser?.locality,
          message: 'Locality',
        },
        { field: 'state_id', value: selectedUser?.state_id, message: 'State' },
        { field: 'city_id', value: selectedUser?.city_id, message: 'City' },
        { field: 'role_id', value: selectedUser?.role_id, message: 'Role' },
        {
          field: 'zip',
          value: selectedUser?.zip,
          message: 'Zip',
          type: VALIDATIONTYPE.ISZIP,
        },
      ];

      if (isPBPartner) {
        valifationRules.push(
          {
            field: 'first_name',
            value: selectedUser?.first_name,
            message: 'First Name',
          },
          {
            field: 'middle_name',
            value: selectedUser?.middle_name,
            message: 'Middle Name',
          },
          {
            field: 'last_name',
            value: selectedUser?.last_name,
            message: 'Last Name',
          }
        );
      } else {
        valifationRules.push({
          field: 'name',
          value: selectedUser?.name,
          message: 'Name',
        });
      }

      let { isError, errors } = validateForm(valifationRules);
      if (isError) {
        setErrors(errors);
      } else {
        let apiMethod: 'POST' | 'PATCH' = 'POST'; // Default to POST

        let apiUrl = apiBaseUrl.ADMINS_USER;

        // Check if selectedUser is present; if yes, it's an edit
        if (isEdit) {
          apiMethod = 'PATCH';
          apiUrl += `/${selectedUser?.id}`;
        }

        const data = {
          endpoint: apiUrl,
          method: apiMethod,
          body: selectedUser,
        };
        const response = await apiAction.mutateAsync(data);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setSelectedUser({});
          setShowAddUserModal(false);

          if (isEdit) {
            // Get the current state of user list
            const currentUsers = Array.isArray(filteredUserData)
              ? filteredUserData
              : [];

            // Find the index of the updated user in the state
            const updatedUserIndex = currentUsers.findIndex(
              (user: any) => user.id === userList.id
            );

            // Only update the user's data in the state if the user exists
            if (updatedUserIndex !== -1) {
              // Create a new copy of the currentUsers array
              const updatedUsers = [...currentUsers];

              // Update the specific user's data
              updatedUsers[updatedUserIndex] = {
                ...updatedUsers[updatedUserIndex],
                ...response.data,
              };

              // Set the updated user list to the state
              setFilteredUserData(updatedUsers);
            }
          } else {
            fetchUsers();
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

  const handleInputChange = (key: string, value: string) => {
    // Update the form data state in the parent component
    setSelectedUser((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    if (isRequired(value)) {
      setErrors((prevData) => ({
        ...prevData,
        [key]: '',
      }));
    }
  };

  const handleAddAdminClick = () => {
    // Logic to open the AddAdmin modal
    setShowAddUserModal(true);
    setSelectedUser({
      roles: [],
      isNew: true,
    });
  };

  const handleConfirmationDialog = async (item: any) => {
    setSelectedUser(item);
    setConfirmationDialog(true);
  };

  const columns: UsersColumn[] = [
    {
      accessorKey: isPBPartner ? 'first_name' : 'name',
      header: 'Name',
      render: (item: any) => (
        <Button
          variant='link'
          className='font-bold text-blueButton-default hover:no-underline'
          onClick={() => {
            handleEditClick(item);
            setShowAddUserModal(true);
          }}
        >
          {isPBPartner ? item?.first_name + ' ' + item.last_name : item?.name}
        </Button>
      ),
    },
    { accessorKey: 'phone', header: 'Contact' },
    {
      accessorKey: 'city',
      header: 'City',
      render: (item: any) => <span>{item?.city?.name}</span>,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      render: (item: any) => {
        const [statusString, className] = getStatusString(item?.is_active);
        return (
          <span className={className} style={{ color: className }}>
            {statusString}
          </span>
        );
      },
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: any) => (
        <div className='flex gap-3'>
          {item.is_active === 2 && (
            <Button
              size='xs'
              variant='secondary'
              icon={<IconAddLine />}
              onClick={() => handleConfirmationDialog(item)}
            >
              Activate
            </Button>
          )}
          {item.is_active === 1 && (
            <>
              <Button
                size='xs'
                onClick={() => handleEditClick(item)}
                icon={<IconEdit />}
              >
                Edit
              </Button>
              <Button
                size='xs'
                variant='destructive'
                icon={<IconMinus />}
                onClick={() => handleConfirmationDialog(item)}
              >
                DeActivate
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className='grid w-full grid-cols-1 gap-5 md:grid-cols-4 '>
          <div className='col-span-2'>
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className='col-span-2 flex gap-5 md:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddAdminClick} // Call the function provided by the parent
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add Admin
            </Button>
          </div>
        </div>

        {<TableComponent columns={columns} data={filteredUserData} />}

        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => setConfirmationDialog(false)}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick:
                selectedUser?.is_active === 2
                  ? handleActivateClick
                  : handleDeActivateClick,
              btnLoading: loading,
              icon: loading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          {selectedUser?.is_active === 2 ? (
            <>Do You Really Want to Activate This User?</>
          ) : (
            <>Do You Really Want to Deactivate This User?</>
          )}
        </ConfirmationDialog>

        {showAddUserModal && (
          <AddAdmin
            open={!!selectedUser}
            selectedData={selectedUser}
            helperData={helperData}
            loading={loading}
            onSave={handleSave}
            formErrors={errors}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => setShowAddUserModal(false)} // Set onClose to a function that sets selectedRow to null
          />
        )}
      </div>
    </div>
  );
}

export default UserList;
