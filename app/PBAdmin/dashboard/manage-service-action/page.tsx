'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { validateForm } from '@/utils/FormValidationRules';
import { getActiveDeactiveMsg, updateArray } from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import AddServiceAction from './AddServiceAction';

interface ManageServiceActionColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageServiceActionProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ManageServiceAction() {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ManageServiceActionProps | null>(null);
  const [list, setList] = useState<Array<ManageServiceActionProps>>();
  const [errors, setErrors] = useState<ManageServiceActionProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmation, setConfirmation] = useState(false);
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchList();
  }, []);

  const handleSave = async (formData: FormData) => {
    const { name, description } = formData;
    const valifationRules = [
      { field: 'name', value: name, message: 'Title' },
      { field: 'description', value: description, message: 'Description' },
    ];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedItem?.id) {
        let params = {
          ...formData,
        };
        let status = await update(selectedItem.id, params);
        if (status) {
          setSelectedItem(null);
          setShowModal(false);
        }
      } else {
        const request = {
          endpoint: API_ENDPOINTS.SERVICEACTION,
          method: 'POST',
          body: formData,
        };
        const response = await apiAction.mutateAsync(request);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setSelectedItem(null);
          setShowModal(false);
          fetchList();
        }
      }
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string | number) => {
    // Update the form data state in the parent component
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    setErrors((prevError) => {
      return {
        ...prevError,
        [key]: '',
      };
    });
  };

  const fetchList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${API_ENDPOINTS.SERVICEACTION}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setList(data);
      else setList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const update = async (id: string | undefined, params: any) => {
    try {
      let updateRequest = {
        endpoint: `${API_ENDPOINTS.SERVICEACTION}/${id}`,
        method: 'PATCH',
        body: params,
      };
      const { data, isError, errors } =
        await apiAction.mutateAsync(updateRequest);
      if (data) {
        data.isLoading = false;
        let tempList = updateArray(list || [], data);
        setList([...tempList]);
      }
      if (isError) {
        setErrors(errors);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleStatuClick = async () => {
    setLoading(true);
    let item = selectedItem as ManageServiceActionProps;
    let tempList = list || [];
    let params = {
      is_active: item.is_active == 1 ? 2 : 1,
    };
    let status = await update(item.id, params);
    if (!status) {
      setList([...tempList]);
    } else {
      setSelectedItem(null);
      setConfirmation(false);
    }
    setLoading(false);
  };

  const handleEditClick = (item: ManageServiceActionProps) => {
    setErrors({});
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setShowModal(true);
  };
  const columns: ManageServiceActionColumneProps[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'active',
      header: 'Active',
      render: (item: any) => (
        <span>{item?.is_active == 1 ? 'Active' : 'Not Active'}</span>
      ),
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: ManageServiceActionProps) => (
        <div className='flex gap-3'>
          {item.is_active == 1 && (
            <Button
              size='xs'
              disabled={item.isLoading}
              onClick={() => handleEditClick(item)}
              icon={<IconEdit />}
            >
              Edit
            </Button>
          )}
          <Button
            size='xs'
            variant='secondary'
            icon={
              item.isLoading ? (
                <IconLoading />
              ) : item.is_active != 1 ? (
                <IconAddLine />
              ) : (
                <IconMinus />
              )
            }
            disabled={item.isLoading}
            onClick={() => {
              setConfirmation(true);
              setSelectedItem(item);
            }}
          >
            {item.is_active != 1 ? 'Activate' : 'DeActivate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className='grid w-full grid-cols-3 gap-5 '>
          <div className='col-span-3 flex gap-5 md:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              New Service Action
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={list} />
        {showModal && (
          <AddServiceAction
            open={showModal}
            data={selectedItem}
            onSave={handleSave}
            formErrors={errors}
            isLoading={saveLoading}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setSelectedItem(null);
              setShowModal(false);
              setErrors({});
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}

        <ConfirmationDialog
          isOpen={isConfirmation}
          onClose={() => {
            setConfirmation(false);
            setSelectedItem(null);
          }}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: handleStatuClick,
              btnLoading: saveLoading,
              icon: saveLoading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          {getActiveDeactiveMsg(selectedItem?.is_active, 'Record')}
        </ConfirmationDialog>
      </div>
    </div>
  );
}

export default ManageServiceAction;
