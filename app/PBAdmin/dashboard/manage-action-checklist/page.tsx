'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import AddActionCheckList from './AddActionCheckList';
import { validateForm } from '@/utils/FormValidationRules';
import { getActiveDeactiveMsg, updateArray } from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface ActionCheckListColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ActionCheckListProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ActionCheckList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActionCheckListProps | null>(
    null
  );
  const [list, setList] = useState<Array<ActionCheckListProps>>();
  const [errors, setErrors] = useState<ActionCheckListProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchList();
  }, []);

  const handleSave = async (_formData: any) => {
    const { name, description } = _formData;
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
          ..._formData,
        };
        let status = await update(selectedItem.id, params);
        if (status) {
          setSelectedItem(null);
          setShowModal(false);
        }
      } else {
        const request = {
          endpoint: API_ENDPOINTS.ACTIONCHECKLIST,
          method: 'POST',
          body: _formData,
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

  const handleInputChange = (key: string, value: string) => {
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
        endpoint: `${API_ENDPOINTS.ACTIONCHECKLIST}?need_all=1`,
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
        endpoint: `${API_ENDPOINTS.ACTIONCHECKLIST}/${id}`,
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
    let params = {
      is_active: selectedItem?.is_active == 1 ? 2 : 1,
    };
    await update(selectedItem?.id, params);
    setLoading(false);
    setConfirmationDialog(false);
    setSelectedItem({});
  };

  const handleEditClick = (item: ActionCheckListProps) => {
    setErrors({});
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleConfirmationDialog = async (item: any) => {
    setSelectedItem(item);
    setConfirmationDialog(true);
  };

  const columns: ActionCheckListColumneProps[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'active',
      header: 'Active',
      render: (item: any) => (
        <span>{item?.is_active == 1 ? 'Active' : 'Not active'}</span>
      ),
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: ActionCheckListProps) => (
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
            onClick={() => handleConfirmationDialog(item)}
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

        <div className='grid w-full grid-cols-3 gap-5'>
          <div className='col-span-3 ml-auto flex gap-5'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add New Check List
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={list} />
        {showModal && (
          <AddActionCheckList
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
          isOpen={isConfirmationDialogOpen}
          onClose={() => {
            setConfirmationDialog(false);
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

export default ActionCheckList;
