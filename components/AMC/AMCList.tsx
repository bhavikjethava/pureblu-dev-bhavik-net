import { apiCall } from '@/hooks/api';
import { validateForm } from '@/utils/FormValidationRules';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import React, { FC, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { Button } from '../ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import Breadcrumb from '../Breadcrumb';
import TableComponent from '../Table';
import AddAMC from './AddAmc';
import {
  getActiveDeactiveMsg,
  isPBEnterpriseUser,
  isPBPartnerUser,
  updateArray,
} from '@/utils/utils';
import ConfirmationDialog from '../ConfirmationDialog';
import { usePathname } from 'next/navigation';
import SearchInput from '../SearchInput';

interface ManageAmcColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageAmcItemProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

const PERPAGE = 50;
const AMCList = ({ apiBaseUrl }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ManageAmcItemProps | null>(
    null
  );
  const [list, setList] = useState<Array<ManageAmcItemProps>>();
  const [filterList, setFilterList] = useState<Array<ManageAmcItemProps>>();
  const [helperData, setHelperData] = useState({ brand: undefined } as {
    brand: [] | undefined;
  });
  const [errors, setErrors] = useState<ManageAmcItemProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmation, setConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const apiAction = useMutation(apiCall);
  const pathName = usePathname();
  const isPBPartner = isPBPartnerUser(pathName);
  const isPBEnterprise = isPBEnterpriseUser(pathName);

  const fetchHelperData = async () => {
    try {
      const brandsresponse = {
        endpoint: API_ENDPOINTS.BRAND,
        method: 'GET',
      };

      const brandsData = await apiAction.mutateAsync(brandsresponse);

      setHelperData({
        brand: brandsData?.data?.data,
      });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  useEffect(() => {
    if (!isPBPartner) fetchHelperData();
  }, []);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // useEffect(() => {
  //   const filterPartnerData = list?.filter((item: any) => {
  //     return Object.values(item as { [key: string]: unknown }).some((value) =>
  //       String(value).toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   });
  //   setFilterList(filterPartnerData);
  // }, [searchTerm, list]);

  useEffect(() => {
    if (searchTerm.length > 2 || filterList != undefined) {
      const getData = setTimeout(() => {
        setPage(1);
        if (page === 1) {
          fetchList();
        }
      }, 500);

      return () => clearTimeout(getData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSave = async (formData: FormData) => {
    const {
      amc_code,
      amc_description,
      compressor_type,
      condensor_cooling_coil,
      machine_age,
      no_of_days,
      services_in_year,
      brand_ids,
      service_name,
    } = formData;
    const valifationRules = [
      { field: 'amc_code', value: amc_code, message: 'Code' },
      {
        field: 'amc_description',
        value: amc_description,
        message: 'Description',
      },
      {
        field: 'compressor_type',
        value: compressor_type,
        message: 'Compressor Type',
      },
      {
        field: 'compressor_type',
        value: compressor_type,
        message: 'Compressor Type',
      },
      {
        field: 'condensor_cooling_coil',
        value: condensor_cooling_coil == 0 ? -1 : condensor_cooling_coil,
        message: 'Condensor Coil',
      },
      { field: 'machine_age', value: machine_age, message: 'Machine Age' },
      { field: 'no_of_days', value: no_of_days, message: 'No of Days' },
      {
        field: 'services_in_year',
        value: services_in_year,
        message: 'Services in a year',
      },
    ];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedItem?.id) {
        let params: any = {
          amc_code,
          amc_description,
          compressor_type,
          condensor_cooling_coil,
          machine_age,
          no_of_days,
          services_in_year,
          brand_ids,
        };
        if (service_name) {
          let serviceName = service_name;
          let filteredObj: any = {};
          for (let key in serviceName) {
            if (serviceName[key] !== '') {
              filteredObj[key] = serviceName[key];
            }
          }
        }
        let { status, data }: any = await update(selectedItem.id, params);
        if (status) {
          setSelectedItem(null);
          setShowModal(false);
          const tempList = updateArray(filterList || [], data);
          setFilterList(tempList);
        }
      } else {
        const request = {
          endpoint: apiBaseUrl.MANAGEAMC,
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
        endpoint: isPBPartner
          ? `${apiBaseUrl?.AMC_PLANS}?per_page=${PERPAGE}&page=${page}&search=${searchTerm}`
          : `${apiBaseUrl?.MANAGEAMC}?per_page=${PERPAGE}&page=${page}&search=${searchTerm}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data?.data) {
        setFilterList(data?.data);
        setTotal(data.total);
      } else {
        setFilterList([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const update = async (id: string | undefined, params: any) => {
    try {
      let updateRequest = {
        endpoint: `${apiBaseUrl.MANAGEAMC}/${id}`,
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
        return { status: false };
      }
      return { status: true, data };
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleStatuClick = async () => {
    setLoading(true);
    let item = selectedItem as ManageAmcItemProps;
    let tempList = list || [];
    let params = {
      is_active: item.is_active == 1 ? 2 : 1,
    };
    let { status, data }: any = await update(item.id, params);
    if (!status) {
      setList([...tempList]);
    } else {
      setSelectedItem(null);
      setConfirmation(false);
      const tempFilterList = updateArray(filterList || [], data);
      setFilterList(tempFilterList);
    }
    setLoading(false);
  };

  const handleEditClick = (item: ManageAmcItemProps) => {
    setErrors({});
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const onNext = () => {
    setPage((prePage) => prePage + 1);
  };

  const onPrevious = () => {
    setPage((prePage) => prePage - 1);
  };

  const columns: ManageAmcColumneProps[] = [
    {
      accessorKey: 'Action old',
      header: '',
      className: 'max-w-[100px]',
      render: (item: any) => (
        <Button variant='destructive' size='xs'>
          Old
        </Button>
      ),
    },
    { accessorKey: 'amc_code', header: 'Code', className: 'max-w-[150px]' },
    { accessorKey: 'amc_description', header: 'Description' },
    {
      accessorKey: 'no_of_days',
      header: 'No. of days',
      className: 'max-w-[150px] w-full',
    },
    {
      accessorKey: 'services_in_year',
      header: 'Services in year	',
      className: 'max-w-[150px] w-full',
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: 'max-w-[220px] w-full',
      render: (item: ManageAmcItemProps) => (
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

  const partnerColumns =
    isPBPartner || isPBEnterprise
      ? columns.filter(
          (_, index) => index !== 0 && index !== columns.length - 1
        )
      : [];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-9'>
          <div className='lg:col-span-7'>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder='Name (Min 3 character) or Contact no (full) or EmailID or User Id'
            />
          </div>

          <div className='flex gap-5 lg:col-span-2'>
            {!(isPBPartner || isPBEnterprise) && (
              <Button
                variant={'secondary'}
                className='w-full'
                onClick={handleAddClick} // Call the function provided by the
                icon={<IconAddLine className='h-5 w-5 text-white' />}
              >
                Add New AMC
              </Button>
            )}
          </div>
        </div>

        <TableComponent
          columns={isPBPartner || isPBEnterprise ? partnerColumns : columns}
          data={filterList}
          currentPage={page}
          totalPage={total}
          entriesPerPage={PERPAGE}
          onNext={onNext}
          onPrevious={onPrevious}
        />
        {showModal && (
          <AddAMC
            open={showModal}
            data={selectedItem}
            onSave={handleSave}
            helperData={helperData}
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
};

export default AMCList;
