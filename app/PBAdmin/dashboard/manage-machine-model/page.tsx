'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { validateForm } from '@/utils/FormValidationRules';
import {
  HELPERSDATA,
  HelperData,
  arrayToObjectConveter,
  getActiveDeactiveMsg,
  updateArray,
} from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import AddMachineModel from './AddMachineModel';
import { DataContext } from '@/context/dataProvider';
import SearchInput from '@/components/SearchInput';
import Loader from '@/components/Loader';

interface ManageMachineModelColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageMachineModelProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}
const PERPAGE = 50;
let isPageFullLoaded = false;
const ManageMachineModel = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ManageMachineModelProps | null>(null);
  const [list, setList] = useState<Array<ManageMachineModelProps>>();
  const [errors, setErrors] = useState<ManageMachineModelProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmation, setConfirmation] = useState(false);
  const [formHelper, setFormHelper] = useState<HelperData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const apiAction = useMutation(apiCall);
  const { state } = useContext(DataContext);

  useEffect(() => {
    fetchBrand();
    fetchMachineType();
    fetchMachineVariant();
  }, []);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      let capcityObject = arrayToObjectConveter(
        state?.[HELPERSDATA].capacity_unit
      );
      let ratingObject = arrayToObjectConveter(state?.[HELPERSDATA].rating);
      setFormHelper((prev) => {
        return {
          ...prev,
          capcityUnitList: state?.[HELPERSDATA].capacity_unit,
          rating: state?.[HELPERSDATA].rating,
          capcityObject,
          ratingObject,
        };
      });
    }
  }, [state?.[HELPERSDATA]]);

  useEffect(() => {
    fetchList();
  }, [page]);

  useEffect(() => {
    if (isPageFullLoaded) {
      const getData = setTimeout(() => {
        setPage(1);
        if (page === 1) {
          fetchList();
        }
      }, 500);

      return () => clearTimeout(getData);
    }
  }, [searchTerm]);

  const onSearch = (text: string) => {
    setSearchTerm(text);
  };

  const onNext = () => {
    setPage((prePage) => prePage + 1);
  };

  const onPrevious = () => {
    setPage((prePage) => prePage - 1);
  };

  const fetchBrand = async () => {
    try {
      const fetchBrand = {
        endpoint: `${API_ENDPOINTS.BRAND}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBrand);
      if (data) {
        setFormHelper((prev) => {
          return {
            ...prev,
            brandList: data,
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchMachineType = async () => {
    try {
      const fetchMachineType = {
        endpoint: `${API_ENDPOINTS.MACHINETYPE}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchMachineType);
      if (data) {
        setFormHelper((prev) => {
          return {
            ...prev,
            machineTypeList: data,
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchMachineVariant = async () => {
    try {
      const fetchVariant = {
        endpoint: `${API_ENDPOINTS.MACHINEVARIANT}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchVariant);
      if (data) {
        setFormHelper((prev) => {
          return {
            ...prev,
            variantList: data,
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleSave = async (formData: FormData) => {
    const {
      machine_type_id,
      brand_id,
      machine_variant_id,
      model_number,
      capacity,
      capacity_unit,
      rating,
    } = formData;
    const valifationRules = [
      {
        field: 'machine_type_id',
        value: machine_type_id,
        message: 'Machine Type',
      },
      { field: 'brand_id', value: brand_id, message: 'Brand' },
      {
        field: 'machine_variant_id',
        value: machine_variant_id,
        message: 'Machine Variant',
      },
      { field: 'model_number', value: model_number, message: 'Model Number' },
      { field: 'capacity', value: capacity, message: 'Capacity' },
      {
        field: 'capacity_unit',
        value: capacity_unit,
        message: 'Capacity unit',
      },
      { field: 'rating', value: rating, message: 'Rating' },
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
          endpoint: API_ENDPOINTS.MACHINEMODEL,
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
        endpoint: `${API_ENDPOINTS.MACHINEMODEL}?search=${searchTerm}&page=${page}&per_page=${PERPAGE}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) {
        setList(data?.data);
        setTotal(data?.total);
        isPageFullLoaded = true;
      } else setList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const update = async (id: string | undefined, params: any) => {
    try {
      let updateRequest = {
        endpoint: `${API_ENDPOINTS.MACHINEMODEL}/${id}`,
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
    let item = selectedItem as ManageMachineModelProps;
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

  const handleEditClick = (item: ManageMachineModelProps) => {
    setErrors({});
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setShowModal(true);
  };
  const columns: ManageMachineModelColumneProps[] = [
    {
      accessorKey: 'brand',
      header: 'Brand',
      render: (item: any) => <span>{item?.brand?.name}</span>,
    },
    {
      accessorKey: 'machine_type',
      header: 'Machine Type',
      render: (item: any) => <span>{item?.machine_type?.name}</span>,
    },
    {
      accessorKey: 'machine_variant',
      header: 'Machine Variant',
      render: (item: any) => <span>{item?.machine_variant?.name}</span>,
    },
    { accessorKey: 'model_number', header: 'Model Number' },
    { accessorKey: 'capacity', header: 'Capacity' },
    {
      accessorKey: 'capacity_unit',
      header: 'Capacity Unit',
      className: 'max-w-[120px]',
      render: (item: any) => (
        <span>
          {formHelper.capcityObject
            ? formHelper.capcityObject[item?.capacity_unit]
            : ''}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      className: 'max-w-[100px]',
      render: (item: any) => (
        <span>
          {formHelper.ratingObject ? formHelper.ratingObject[item?.rating] : ''}
        </span>
      ),
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: 'min-w-[220px] max-w-[180px]',
      render: (item: ManageMachineModelProps) => (
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

        <div className='grid w-full gap-5 lg:grid-cols-5'>
          <div className='lg:col-span-4'>
            <SearchInput value={searchTerm} onChange={onSearch} />
          </div>
          <div className='col-span-1 flex gap-5'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              New Machine Model
            </Button>
          </div>
        </div>

        <TableComponent
          columns={columns}
          data={list}
          currentPage={page}
          totalPage={total}
          entriesPerPage={PERPAGE}
          onNext={onNext}
          onPrevious={onPrevious}
        />
        {apiAction.isLoading && isPageFullLoaded ? <Loader /> : null}
        {showModal && (
          <AddMachineModel
            open={showModal}
            data={selectedItem}
            onSave={handleSave}
            formErrors={errors}
            isLoading={saveLoading}
            formHelper={formHelper}
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
};

export default ManageMachineModel;
