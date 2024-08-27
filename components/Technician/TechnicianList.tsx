import React, { FC, useContext, useEffect, useState } from 'react';
import Breadcrumb from '../Breadcrumb';
import SearchInput from '../SearchInput';
import SelectBox from '../SelectBox';
import { Button } from '../ui/button';
import {
  IconAddLine,
  IconBxErrorCircle,
  IconEdit,
  IconLoading,
  IconSearch,
} from '@/utils/Icons';
import TableComponent from '../Table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import ROUTES, {
  HELPERSDATA,
  REFRESH_TECHNICIANLIST,
  deleteArrayItem,
  getAuthKeyFromPath,
  getBaseUrl,
  getStatusString,
} from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import { showToast } from '../Toast';
import AddTechnician from './AddTechnician';
import ConfirmationDialog from '../ConfirmationDialog';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import Loader from '../Loader';
import { useAccessRights } from '@/hooks/useAccessRights';

const availableList = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Available' },
  { id: 2, name: 'UnAvailable' },
];

interface UserTypes {
  [key: string]: any;
}

interface TechnicianColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

interface TechnicianListProps {
  apiBaseUrl: any;
}

let userData: any = {};
const PERPAGE = 50;
const TechnicianList: FC<TechnicianListProps> = ({ apiBaseUrl }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setselectedItem] = useState<UserTypes>();
  const [showModal, setshowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [itemList, setitemList] = useState<UserTypes | undefined>();
  const [helperData, setHelperData] = useState();
  const [loading, setLoading] = useState(false);
  const [partnerList, setPartnerList] = useState<any>([]);
  const { state, setData } = useContext(DataContext);
  const [isConfirmation, setConfirmation] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isLoadTechnicianInfo, setLoadTechnicianInfo] = useState(false);
  const router = useRouter();
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const type = getAuthKeyFromPath(pathname);
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [technicianList, setTechnicianList] = useState<any>();
  const [activeTechnician, setActiveTechnician] = useState(null);
  const [isActive, setIsActiveTechnician] = useState(0);
  const { isAccess } = useAccessRights();

  useEffect(() => {
    userData = JSON.parse(localStorage.getItem(`${type}_user_info`) || '');
    fetchHelperData();
    if (isPBPartner) {
      setPartnerList([userData.partner]);
    } else {
      fetchPartner();
    }
  }, []);

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
    fetchTechnician();
  }, [page, state?.[REFRESH_TECHNICIANLIST]]);

  useEffect(() => {
    if (page == 1) {
      fetchTechnician();
    } else {
      setPage(1);
    }
  }, [isActive]);

  const handleSearchClick = async () => {
    if (!searchTerm || searchTerm.length < 3) {
      showToast({
        variant: 'destructive',
        message: 'Please enter minimum 3 character to search',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
      return; // Stop execution if no search term is entered
    }
    if (page == 1) {
      fetchTechnician();
    } else {
      setPage(1);
    }
  };

  const fetchTechnician = async () => {
    try {
      const getdata = {
        endpoint: `${apiBaseUrl.TECHNICIAN}?search=${searchTerm}&page=${page}&per_page=${PERPAGE}`,
        method: 'GET',
      };

      if (isActive > 0) {
        getdata.endpoint += `&is_active=${isActive}`;
      }

      setTechnicianList(undefined);

      const { data } = await apiAction.mutateAsync(getdata);
      setActiveTechnician(data.active_technician);
      setTechnicianList(data.technician.data);
      setTotal(data.technician?.total);
    } catch (error) {
      console.error('Failed to fetch technician:', error);
    }
  };

  const fetchPartner = async () => {
    const getPartner = {
      endpoint: `${apiBaseUrl?.PARTNER}?need_all=1`,
      method: 'GET',
    };
    const { data: allPartner } = await apiAction.mutateAsync(getPartner);
    setPartnerList(allPartner);
  };

  const fetchHelperData = async () => {
    try {
      const skillsresponse = {
        endpoint: apiBaseUrl.SKILL,
        method: 'GET',
      };
      apiAction.mutateAsync(skillsresponse).then((skillsData) => {
        setHelperData((pre: any) => {
          return {
            ...pre,
            skill: skillsData.data.data,
          };
        });
      });

      const brandsresponse = {
        endpoint: apiBaseUrl.BRAND,
        method: 'GET',
      };
      apiAction.mutateAsync(brandsresponse).then((brandsData) => {
        setHelperData((pre: any) => {
          return {
            ...pre,
            brand: brandsData.data.data,
          };
        });
      });

      const machineresponse = {
        endpoint: apiBaseUrl.MACHINETYPE,
        method: 'GET',
      };
      apiAction.mutateAsync(machineresponse).then((machineData) => {
        setHelperData((pre: any) => {
          return {
            ...pre,
            machine: machineData.data.data,
          };
        });
      });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleTechnicianTypeChage = (technicianTypeId: any) => {
    setIsActiveTechnician(technicianTypeId);
  };

  const handleAddAdminClick = () => {
    // Logic to open the AddAdmin modal
    setshowModal(true);
    setselectedItem({
      isNew: true,
      ...(isPBPartner && { partner_id: userData.partner.id }),
    });
  };

  const handleEditClick = async (rowData: any) => {
    const getPartner = {
      endpoint: `${apiBaseUrl?.TECHNICIAN}/${rowData?.id}`,
      method: 'GET',
    };
    setLoadTechnicianInfo(true);
    const { data: technicianInfo } = await apiAction.mutateAsync(getPartner);
    setselectedItem({
      ...technicianInfo,
      allState: [{ ...rowData.state }],
      allCity: [{ ...rowData.city }],
      ...(isPBPartner && { partner_id: userData.partner.id }),
    });
    setshowModal(true);
    setLoadTechnicianInfo(false);
    setErrors({});
  };

  const handleDeleteClick = (item: any) => {
    setConfirmation(true);
    setselectedItem(item);
  };

  const handleDeleteConfirmationClick = async () => {
    setSaveLoading(true);
    try {
      const deleteTechnician = {
        endpoint: `${apiBaseUrl.TECHNICIAN}/${selectedItem?.id}`,
        method: 'DELETE',
      };

      const { data, isError } = await apiAction.mutateAsync(deleteTechnician);
      if (!isError) {
        const tempTechnician = {
          data: {
            technician: deleteArrayItem(technicianList, selectedItem as any),
          },
        };
        setConfirmation(false);
        // setitemList(tempTechnician);
        setTechnicianList(tempTechnician.data.technician);

        setselectedItem({});
      }

      setSaveLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
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
          key == 'allPartner' ||
          key == 'allCity' ||
          key == 'allPartner' ||
          key == 'partner' ||
          key == 'brands' ||
          key == 'skills' ||
          key == 'allState' ||
          key == 'machines_variant' ||
          (isEdit &&
            key == 'profile_image' &&
            !(selectedItem?.profile_image instanceof File))
        )
          return;

        const value = itemList[key];

        if (
          (key === 'skill_ids' ||
            key === 'brand_ids' ||
            key === 'machine_variant_ids') &&
          Array.isArray(value)
        ) {
          // If the key is 'skill_ids' or 'brand_ids' and the value is an array,
          // append each ID individually
          value.forEach((id, index) => {
            data.append(`${key}[${index}]`, id);
          });
        } else {
          // For other fields, append as usual
          data.append(key, value);
        }
      });

      const valifationRules = [
        { field: 'name', value: selectedItem?.name, message: 'Name' },
        {
          field: 'email',
          value: selectedItem?.email,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        },
        {
          field: 'partner_id',
          value: selectedItem?.partner_id,
          message: 'Partner',
        },
        {
          field: 'phone',
          value: selectedItem?.phone,
          message: 'Mobile No.',
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
        {
          field: 'status',
          value: selectedItem?.status,
          message: 'status',
        },
        {
          field: 'profile_image',
          value: selectedItem?.profile_image,
          message: 'Profile Image',
          type: VALIDATIONTYPE.ISFILE,
        },
      ];

      let { isError, errors } = validateForm(valifationRules);

      if (!selectedItem?.profile_image) {
        isError = true;
        errors['logo'] = `Logo ${ERROR_MESSAGES.required}`;
      }

      if (isError) {
        setErrors(errors);
      } else {
        let apiUrl = apiBaseUrl.TECHNICIAN;

        const technician = {
          endpoint: apiUrl,
          method: 'POST',
          body: data,
          isFormData: true,
        };
        if (isEdit)
          technician.endpoint = `${technician.endpoint}/${selectedItem.id}?_method=patch`;
        const response = await apiAction.mutateAsync(technician);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setselectedItem({});
          setshowModal(false);

          if (isEdit) {
            // Get the current state of user list
            const currentUsers = Array.isArray(technicianList)
              ? technicianList
              : [];

            // Find the index of the updated user in the state
            const updatedUserIndex = currentUsers.findIndex(
              (user: any) => user.id === itemList.id
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
              setTechnicianList(updatedUsers);
            }
          } else {
            setData({
              [REFRESH_TECHNICIANLIST]: !state?.[REFRESH_TECHNICIANLIST],
            });
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

  const onNext = () => {
    setPage((prePage) => prePage + 1);
  };

  const onPrevious = () => {
    setPage((prePage) => prePage - 1);
  };

  const columns: TechnicianColumn[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      className: 'max-w-[100px]',
      render: (item: any) => (
        <Badge variant={'secondary'}>{item.type || 'new'}</Badge>
      ),
    },
    { accessorKey: 'id', header: 'Technician ID' },
    {
      accessorKey: 'name',
      header: 'Name',
      className: 'min-w-[200px]',
      render: (item: any) => (
        <Link
          href={`${ROUTES.TECHNICIANS}/${item.id}`}
          className='flex font-bold text-blueButton-default'
          onClick={(e) => {
            e.preventDefault();
            setData({ technician: item });
            router.push(`${ROUTES.TECHNICIANS}/${item.id}`);
          }}
        >
          {item?.name}
        </Link>
      ),
    },
    { accessorKey: 'phone', header: 'Contact' },
    {
      accessorKey: 'city',
      header: 'City',
      render: (item: any) => <span>{item?.city?.name}</span>,
    },
    {
      accessorKey: 'partner',
      header: 'Partner',
      render: (item: any) => <span>{item?.partner?.name}</span>,
    },
    { accessorKey: 'created_at', header: 'Created On' },
    {
      accessorKey: 'status',
      header: 'Status',
      className: 'max-w-[100px]',
      render: (item: any) => {
        const [statusString, className] = getStatusString(item?.status);
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
      className: 'min-w-[170px]',
      render: (item: any) => (
        <div className='flex gap-3'>
          <Button
            size='xs'
            onClick={() => handleEditClick(item)}
            icon={<IconEdit />}
          >
            Edit
          </Button>
          {(isPBPartner && isAccess) && (
            <Button size='xs' onClick={() => handleDeleteClick(item)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col gap-5 bg-white p-5'>
      <Breadcrumb />

      <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-9'>
        <div className='lg:col-span-3'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearchClick}
            placeholder='Name (Min 3 character) or Contact no (full) or ID'
          />
        </div>
        <div className='lg:col-span-3'>
          <SelectBox
            options={availableList}
            value={isActive}
            onChange={(e) => handleTechnicianTypeChage(e)}
            // error={formErrors?.partner_id || ''}
          />
        </div>
        <div className='flex gap-5 lg:col-span-3'>
          <Button
            variant={'blue'}
            className='!w-full'
            onClick={handleSearchClick} // Call the function provided by the parent
            icon={<IconSearch className='h-4 w-4 text-white' />}
          >
            Search Record
          </Button>
          <Button
            variant={'secondary'}
            className='!w-full'
            onClick={handleAddAdminClick} // Call the function provided by the parent
            icon={<IconAddLine className='h-5 w-5 text-white' />}
          >
            Add Technician
          </Button>
        </div>
      </div>
      <div className='flex h-full flex-col gap-3 overflow-auto'>
        <span>No. Of Active Technicians : {activeTechnician}</span>
        {
          <TableComponent
            columns={columns}
            data={technicianList}
            currentPage={page}
            totalPage={total}
            entriesPerPage={PERPAGE}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        }
      </div>
      {showModal && (
        <AddTechnician
          open={!!selectedItem}
          selectedData={selectedItem}
          helperData={helperData}
          onSave={handleSave}
          partnerList={partnerList}
          formErrors={errors}
          loading={loading}
          onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
          onClose={() => setshowModal(false)} // Set onClose to a function that sets selectedRow to null
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
            btnLoading: saveLoading,
            icon: saveLoading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        Do You Really Want to Delete This Record
      </ConfirmationDialog>
      {isLoadTechnicianInfo ? <Loader /> : null}
    </div>
  );
};

export default TechnicianList;
