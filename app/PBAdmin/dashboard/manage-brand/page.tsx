'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  IconAddLine,
  IconEdit,
  IconLoading,
  IconLogIn,
  IconMinus,
} from '@/utils/Icons';
import TableComponent from '@/components/Table';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/SelectBox';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import AddBrand from './AddBrand';
import { validateForm } from '@/utils/FormValidationRules';
import { getActiveDeactiveMsg, updateArray } from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface ManageBrandColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageBrandProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ManageBrand() {
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<ManageBrandProps | null>(
    null
  );
  const [brandList, setBrandList] = useState<Array<ManageBrandProps>>();
  const [errors, setErrors] = useState<ManageBrandProps>({});
  const [saveLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);

  useEffect(() => {
    fetchBrandList();
  }, []);

  const handleSave = async (_formData: any) => {
    const { name } = _formData;
    const valifationRules = [{ field: 'name', value: name, message: 'Title' }];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedBrand?.id) {
        let params = {
          ..._formData,
        };
        let status = await updateBrand(selectedBrand.id, params);
        if (status) {
          setSelectedBrand(null);
          setShowModal(false);
        }
      } else {
        const brand = {
          endpoint: API_ENDPOINTS.BRAND,
          method: 'POST',
          body: formData,
        };
        const response = await apiAction.mutateAsync(brand);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setSelectedBrand(null);
          setShowModal(false);
          fetchBrandList();
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

  const fetchBrandList = async () => {
    try {
      const fetchBrand = {
        endpoint: `${API_ENDPOINTS.BRAND}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBrand);
      if (data) setBrandList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const updateBrand = async (id: string | undefined, params: any) => {
    try {
      let updateBrandRequest = {
        endpoint: `${API_ENDPOINTS.BRAND}/${id}`,
        method: 'PATCH',
        body: params,
      };
      const { data, isError, errors } =
        await apiAction.mutateAsync(updateBrandRequest);
      if (data) {
        data.isLoading = false;
        let tempBrandList = updateArray(brandList || [], data);
        setBrandList([...tempBrandList]);
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
      is_active: selectedBrand?.is_active == 1 ? 2 : 1,
    };
    await updateBrand(selectedBrand?.id, params);
    setLoading(false);
    setConfirmationDialog(false);
    setSelectedBrand({});
  };

  const handleEditClick = (item: ManageBrandProps) => {
    setErrors({});
    setSelectedBrand(item);
    setShowModal(true);
  };

  const handleAddBrandClick = () => {
    setShowModal(true);
  };

  const handleConfirmationDialog = async (item: any) => {
    setSelectedBrand(item);
    setConfirmationDialog(true);
  };

  const columns: ManageBrandColumneProps[] = [
    {
      accessorKey: 'Action old',
      header: '',
      render: (item: any) => (
        <Button variant='destructive' size='xs'>
          Old
        </Button>
      ),
    },
    { accessorKey: 'name', header: 'Brand' },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: ManageBrandProps) => (
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

        <div className='grid w-full grid-cols-3 gap-5 '>
          <div className='col-span-3 flex gap-5 md:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddBrandClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add New Brand
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={brandList} />

        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => {
            setConfirmationDialog(false);
            setSelectedBrand(null);
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
          {getActiveDeactiveMsg(selectedBrand?.is_active, 'Record')}
        </ConfirmationDialog>
        {showModal && (
          <AddBrand
            open={showModal}
            data={selectedBrand}
            onSave={handleSave}
            formErrors={errors}
            isLoading={saveLoading}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setErrors({});
              setSelectedBrand(null);
              setShowModal(false);
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}
      </div>
    </div>
  );
}

export default ManageBrand;
