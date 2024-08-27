'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/SelectBox';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import AddMachineType from './AddMachineType';
import { validateForm } from '@/utils/FormValidationRules';
import { getActiveDeactiveMsg, updateArray } from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface ManageMachineTypeColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageMachineTypeProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ManageMachineType() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMachineType, setSelectedMachineType] =
    useState<ManageMachineTypeProps | null>(null);
  const [machineTypeList, setMachineTypeList] =
    useState<Array<ManageMachineTypeProps>>();
  const [errors, setErrors] = useState<ManageMachineTypeProps>({});
  const [saveLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);

  useEffect(() => {
    fetchMachineTypeList();
  }, []);

  const handleSave = async (_formData: any) => {
    const { name } = _formData;
    const valifationRules = [{ field: 'name', value: name, message: 'Title' }];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedMachineType?.id) {
        let params = {
          ..._formData,
        };
        let status = await updateMachineType(selectedMachineType.id, params);
        if (status) {
          setSelectedMachineType(null);
          setShowModal(false);
        }
      } else {
        const machineType = {
          endpoint: API_ENDPOINTS.MACHINETYPE,
          method: 'POST',
          body: _formData,
        };
        const response = await apiAction.mutateAsync(machineType);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setSelectedMachineType(null);
          setShowModal(false);
          fetchMachineTypeList();
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

  const fetchMachineTypeList = async () => {
    try {
      const fetchMachineType = {
        endpoint: `${API_ENDPOINTS.MACHINETYPE}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchMachineType);
      if (data) setMachineTypeList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const updateMachineType = async (id: string | undefined, params: any) => {
    try {
      let updateMachineTypeRequest = {
        endpoint: `${API_ENDPOINTS.MACHINETYPE}/${id}`,
        method: 'PATCH',
        body: params,
      };
      const { data, isError, errors } = await apiAction.mutateAsync(
        updateMachineTypeRequest
      );
      if (data) {
        data.isLoading = false;
        let tempMachineTypeList = updateArray(machineTypeList || [], data);
        setMachineTypeList([...tempMachineTypeList]);
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
      is_active: selectedMachineType!!.is_active == 1 ? 2 : 1,
    };
    await updateMachineType(selectedMachineType?.id, params);
    setLoading(false);
    setConfirmationDialog(false);
    setSelectedMachineType({});
  };

  const handleEditClick = (item: ManageMachineTypeProps) => {
    setErrors({});
    setSelectedMachineType(item);
    setShowModal(true);
  };

  const handleAddMachineTypeClick = () => {
    setShowModal(true);
  };

  const handleConfirmationDialog = async (item: any) => {
    setSelectedMachineType(item);
    setConfirmationDialog(true);
  };

  const columns: ManageMachineTypeColumneProps[] = [
    { accessorKey: 'name', header: 'Machine Type' },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: ManageMachineTypeProps) => (
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
          <div className='col-span-3 flex gap-5 lg:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddMachineTypeClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              New Machine Type
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={machineTypeList} />
        {showModal && (
          <AddMachineType
            open={showModal}
            data={selectedMachineType}
            onSave={handleSave}
            formErrors={errors}
            isLoading={saveLoading}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setSelectedMachineType(null);
              setShowModal(false);
              setErrors({});
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => {
            setConfirmationDialog(false);
            setSelectedMachineType(null);
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
          {getActiveDeactiveMsg(selectedMachineType?.is_active, 'Record')}
        </ConfirmationDialog>
      </div>
    </div>
  );
}

export default ManageMachineType;
