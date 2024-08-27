'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import AddMachineVariant from './AddMachineVariant';
import { validateForm } from '@/utils/FormValidationRules';
import { updateArray } from '@/utils/utils';

interface ManageVariantColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageVariantProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ManageVariant() {
  const [showModal, setShowModal] = useState(false);
  const [selectedVariant, setSelectedVariant] =
    useState<ManageVariantProps | null>(null);
  const [variantList, setVariantList] = useState<Array<ManageVariantProps>>();
  const [errors, setErrors] = useState<ManageVariantProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [machineTypeList, setMachineTypeList] = useState([]);
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchVariantList();
    fetchMachineTypeList();
  }, []);

  const handleSave = async (formData: FormData) => {
    const { name, machine_type_id } = formData;

    const valifationRules = [
      { field: 'name', value: name, message: 'Title' },
      {
        field: 'machine_type_id',
        value: machine_type_id,
        message: 'Machine Type',
      },
    ];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedVariant?.id) {
        let params = {
          ...formData,
        };
        let status = await updateVariant(selectedVariant.id, params);
        if (status) {
          setSelectedVariant(null);
          setShowModal(false);
        }
      } else {
        const variant = {
          endpoint: API_ENDPOINTS.MACHINEVARIANT,
          method: 'POST',
          body: formData,
        };
        const response = await apiAction.mutateAsync(variant);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setSelectedVariant(null);
          setShowModal(false);
          fetchVariantList();
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

  const fetchVariantList = async () => {
    try {
      const fetchVariant = {
        endpoint: `${API_ENDPOINTS.MACHINEVARIANT}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchVariant);
      if (data) setVariantList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
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

  const updateVariant = async (id: string | undefined, params: any) => {
    try {
      let updateVariantRequest = {
        endpoint: `${API_ENDPOINTS.MACHINEVARIANT}/${id}`,
        method: 'PATCH',
        body: params,
      };
      const { data, isError, errors } =
        await apiAction.mutateAsync(updateVariantRequest);
      if (data) {
        data.isLoading = false;
        let tempVariantList = updateArray(variantList || [], data);
        setVariantList([...tempVariantList]);
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

  const handleEditClick = (item: ManageVariantProps) => {
    setErrors({});
    setSelectedVariant(item);
    setShowModal(true);
  };

  const handleAddVariantClick = () => {
    setShowModal(true);
  };

  const columns: ManageVariantColumneProps[] = [
    { accessorKey: 'name', header: 'Machine Variant' },
    {
      accessorKey: 'machine_type',
      header: 'Machine Type',
      render: (item: any) => <span>{item?.machine_type?.name}</span>,
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: ManageVariantProps) => (
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
        </div>
      ),
    },
  ];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className='grid w-full grid-cols-3 gap-5'>
          <div className='col-span-3 flex gap-5 md:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddVariantClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add New Variant
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={variantList} />
        {showModal && (
          <AddMachineVariant
            open={showModal}
            data={selectedVariant}
            onSave={handleSave}
            formErrors={errors}
            isLoading={saveLoading}
            machineTypeList={machineTypeList}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setSelectedVariant(null);
              setShowModal(false);
              setErrors({});
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}
      </div>
    </div>
  );
}

export default ManageVariant;
