'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import AddSparePart from './AddSparePart';
import { validateForm } from '@/utils/FormValidationRules';
import {
  HELPERSDATA,
  HelperData,
  arrayToObjectConveter,
  getActiveDeactiveMsg,
  updateArray,
} from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { DataContext } from '@/context/dataProvider';

interface SparePartColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface SparePartProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function SparePart() {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SparePartProps | null>(null);
  const [list, setList] = useState<Array<SparePartProps>>();
  const [errors, setErrors] = useState<SparePartProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [helperData, setHelperData] = useState<HelperData>({});
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);
  const apiAction = useMutation(apiCall);
  const { state, setData } = useContext(DataContext);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      let helperData = {
        ...state?.[HELPERSDATA],
        spare_type_object: arrayToObjectConveter(
          state?.[HELPERSDATA].spare_type
        ),
        uom_object: arrayToObjectConveter(state?.[HELPERSDATA].uom),
      };
      setHelperData(helperData);
    }
  }, [state?.[HELPERSDATA]]);

  useEffect(() => {
    let promises = [];
    promises.push(
      new Promise((resolve, reject) => {
        fetchList(resolve);
      })
    );
  }, []);

  const handleSave = async (formData: FormData) => {
    const { particulars, spare_type, uom } = formData;
    const valifationRules = [
      { field: 'particulars', value: particulars, message: 'Particulars' },
      { field: 'spare_type', value: spare_type, message: 'Spare type' },
      { field: 'uom', value: uom, message: 'UOM' },
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
          endpoint: API_ENDPOINTS.SPAREPARTS,
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

  const fetchList = async (resolve?: any) => {
    try {
      const fetchRequest = {
        endpoint: `${API_ENDPOINTS.SPAREPARTS}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setList(data);
      else setList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      if (resolve) resolve();
    }
  };

  const update = async (id: string | undefined, params: any) => {
    try {
      let updateRequest = {
        endpoint: `${API_ENDPOINTS.SPAREPARTS}/${id}`,
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
    let status = await update(selectedItem?.id, params);
    setLoading(false);
    setConfirmationDialog(false);
    setSelectedItem({});
  };

  const handleEditClick = (item: SparePartProps) => {
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

  const columns: SparePartColumneProps[] = [
    { accessorKey: 'particulars', header: 'Particular' },
    {
      accessorKey: 'spare_type',
      header: 'Spare Type',
      className: 'max-w-[150px]',
      render: (item: any) => (
        <span>{helperData?.spare_type_object?.[item?.spare_type]}</span>
      ),
    },
    {
      accessorKey: 'uom',
      header: 'UOM',
      className: 'max-w-[150px]',
      render: (item: any) => <span>{helperData?.uom_object?.[item?.uom]}</span>,
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: 'max-w-[260px]',
      render: (item: SparePartProps) => (
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
              onClick={handleAddClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add New Spare Parts
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={list} />
        {showModal && (
          <AddSparePart
            open={showModal}
            data={selectedItem}
            onSave={handleSave}
            formErrors={errors}
            helperData={helperData}
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

export default SparePart;
