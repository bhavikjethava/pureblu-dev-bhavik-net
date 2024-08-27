'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  IconAddLine,
  IconCheck,
  IconClose,
  IconEdit,
  IconLoading,
  IconLogIn,
} from '@/utils/Icons';

import AddPartner from '../../../../components/Partner/addPartners';
import SearchPartners from './SearchPartners';

import TableComponent from '@/components/Table';
import { API_BASE_URL, API_ENDPOINTS } from '@/utils/apiConfig';
import Loader from '@/components/Loader';
import { useApiResource } from '@/hooks/api';
import { validateForm, VALIDATIONTYPE } from '@/utils/FormValidationRules';
import {
  isRequired,
  isValidPhoneNumber,
  ERROR_MESSAGES,
} from '@/utils/ValidationUtils';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/SelectBox';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DataContext } from '@/context/dataProvider';
import ROUTES, { AUTH, HELPERSDATA, updateArray } from '@/utils/utils';
import { handleLogin } from '@/app/actions';
import { useCookies } from 'next-client-cookies';
import { IconRight } from 'react-day-picker';

interface AddPartnersColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface FormData {
  [key: string]: any;
}

interface optionType {
  id: number;
  name: string;
}

const initialFormData: FormData = { user: {}, state_id: -1 };

function AddPartners() {
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [filterPartner, setFilterPartner] = useState<any | null>(null);
  const [helperData, setHelperData] = useState<{ [key: string]: any }>({});
  const [filterPartnerType, setFilterPartnerType] =
    useState<Array<optionType>>();
  const [adminErrors, setPartnerErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [loginLoader, setLoginLoader] = useState(false);
  const [parentList, setParentList] = useState<Array<object> | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnerType, setSelectedPartnerType] = useState(-1);
  const router = useRouter();
  const { state, setData } = useContext(DataContext);
  const cookies = useCookies();

  useEffect(() => {
    setPartnerErrors({});
  }, [selectedPartner]);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      setHelperData(state?.[HELPERSDATA]);
      let partnerType: any = [...state?.[HELPERSDATA].partner_type];
      if (partnerType?.[0]?.id != -1) {
        partnerType.unshift({ id: -1, name: 'All Account Type' });
      }
      setFilterPartnerType(partnerType);
    }
  }, [state?.[HELPERSDATA]?.partner_type]);

  // Use the usePartners hook
  const { apiAction, isLoading, isError } = useApiResource(
    'getManagePartnersQuery',
    API_ENDPOINTS.PARTNER
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter data based on the search term
    searchPartners(selectedPartnerType);
  }, [searchTerm, parentList]); // Add searchTerm and userList as dependencies

  const handlePartnerChage = (partnerTypeId: number) => {
    if (partnerTypeId > -1) {
      const filterPartnerData = parentList?.filter((item: any) => {
        const keyValues = item['type'];
        const partnerTypeIdString = String(partnerTypeId);
        if (keyValues !== undefined) {
          return String(keyValues) === partnerTypeIdString;
        }
        return false;
      });
      // setFilterPartner(filterPartnerData);
      searchPartners(partnerTypeId);
      setSelectedPartnerType(partnerTypeId);
    } else {
      setSelectedPartnerType(partnerTypeId);
      if (searchTerm == '') {
        setFilterPartner(parentList);
      } else {
        searchPartners(partnerTypeId);
      }
    }
  };

  // Search partner baseed on user search terms
  const searchPartners = (partnerTypeId: number) => {
    const filterPartnerData = parentList?.filter((item: any) => {
      const searchTermLower = searchTerm.toLowerCase();
      const selectedTypeLower =
        partnerTypeId > -1 ? partnerTypeId.toString().toLowerCase() : null;

      const getNestedValue = (obj: any, keyPath: string) => {
        return keyPath.split('.').reduce((acc, key) => acc && acc[key], obj);
      };

      const matchesSearchTerm =
        (item.name &&
          String(item.name).toLowerCase().includes(searchTermLower)) ||
        (getNestedValue(item, 'user.phone') &&
          String(getNestedValue(item, 'user.phone'))
            .toLowerCase()
            .includes(searchTermLower)) ||
        (getNestedValue(item, 'user.city.name') &&
          String(getNestedValue(item, 'user.city.name'))
            .toLowerCase()
            .includes(searchTermLower));

      // const typeMatch = filterPartnerType!.find(
      //   (type) => type.id === item.type
      // );
      const matchesSelectedType = selectedTypeLower
        ? String(item.type).toLowerCase() === selectedTypeLower
        : true;
      // const matchesTypeArray = typeMatch
      //   ? String(typeMatch.name).toLowerCase().includes(searchTermLower)
      //   : false;
      return matchesSearchTerm && matchesSelectedType;
    });
    setFilterPartner(filterPartnerData);
  };

  const fetchData = async () => {
    try {
      const data = {
        endpoint: `${API_ENDPOINTS.PARTNER}?need_all=1`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setParentList(response.data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const accountTypeRender = (type?: string) => {
    let image = '/cblu.png';
    switch (type?.toString()) {
      case '2': {
        image = '/fgreen.png';
        break;
      }
      case '3': {
        image = '/porange.png';
        break;
      }
    }
    return (
      <Image
        className='mr-2 object-contain'
        src={image}
        width={20}
        height={19}
        alt={type || ''}
      />
    );
  };

  // React State: Form data state and function to update it
  const [formData, setFormData] = useState<FormData>(initialFormData);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const handleEditClick = (rowData: FormData) => {
    setShowModal(true);
    setSelectedPartner({ ...rowData });
  };

  const loginAsPartner = async (item: FormData) => {
    try {
      setLoginLoader(true);
      const partnerLogin = {
        endpoint: `${API_ENDPOINTS.PARTNER}/${item.id}/login-request`,
        method: 'POST',
      };
      const partnerLoginResponse = await apiAction.mutateAsync(partnerLogin);
      if (partnerLoginResponse?.data?.access_token) {
        const params = {
          request_secrete: partnerLoginResponse?.data?.access_token,
        };
        const partnerLogin = {
          endpoint: `${API_ENDPOINTS.ADMIN_LOGIN_AS_PARTNER}`,
          method: 'POST',
          body: params,
        };
        const adminLoginAsPartnerResponse =
          await apiAction.mutateAsync(partnerLogin);
        const type = AUTH.PBPARTNER;

        localStorage.setItem(
          `${type}_user_info`,
          JSON.stringify(adminLoginAsPartnerResponse.data)
        );
        localStorage.setItem(
          `${type}_authToken`,
          adminLoginAsPartnerResponse.data.token_info.access_token
        );

        await handleLogin(
          type,
          adminLoginAsPartnerResponse.data.token_info.access_token
        );
        setLoginLoader(false);
        let url = `/${ROUTES.PBPARTNER}/${ROUTES.DASHBOARD}`;
        // const newWindow = window.open(url, '_blank');
        // if (newWindow) newWindow.opener = null;

        // re-name cookies (Login as partner)
        window.location.href = url;
        localStorage.setItem(AUTH.PBADMIN_HOLD, `${cookies.get(AUTH.PBADMIN)}`);
        cookies.remove(AUTH.PBADMIN);
      } else {
        setLoginLoader(false);
      }
    } catch (e) {
      console.log('===> error', e);
    }
  };

  // accept and reject backup request
  const requestStatus = async (item: any, status: number) => {
    try {
      if (status == 2) {
        // accept request
        item.isAccepted = true;
      } else {
        // rejected request
        item.isRejected = true;
      }
      setFilterPartner([...updateArray(filterPartner, item)]);
      const body = {
        is_data_requested: status,
      };

      const request = {
        endpoint: `${API_ENDPOINTS.PARTNER}/${item?.id}/request-data-backup`,
        method: 'POST',
        body,
      };
      const response = await apiAction.mutateAsync(request);
      if (!response?.isError) {
        if (status == 2) {
          response.data.isAccepted = false;
        } else {
          response.data.isRejected = false;
        }
        setFilterPartner([...updateArray(filterPartner, response.data)]);
      }
    } catch (e: any) {
      console.log('status change error', e);
    } finally {
    }
  };

  const columns: AddPartnersColumn[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      render: (item: any) => (
        <Link
          href={`${ROUTES.PARTNERS}/${item.id}`}
          className='flex font-bold text-blueButton-default'
          onClick={(e) => {
            e.preventDefault();
            setData({ partner: item });
            router.push(`${ROUTES.PARTNERS}/${item.id}`);
          }}
        >
          {accountTypeRender(item.type)}
          {item?.name}
        </Link>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      render: (item: any) => <span>{item?.user?.phone}</span>,
    },
    {
      accessorKey: 'city_id',
      header: 'City',
      render: (item: any) => <span>{item?.user?.city?.name}</span>,
    },
    {
      accessorKey: 'active_technicians',
      header: 'Technicians',
      render: (item: any) => (
        <span>
          ({item?.technicians_count} /{' '}
          {item?.active_technicians == 0
            ? 'Unlimited'
            : item?.active_technicians}
          )
        </span>
      ),
    },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: FormData) => (
        <div className='flex gap-3'>
          <Button
            size='xs'
            onClick={() => handleEditClick(item)}
            icon={<IconEdit />}
          >
            Edit
          </Button>

          {/* <a target='_blank' href='/PBPartner/login'> */}
          {item.active_pause == null ? (
            <Button
              size='xs'
              icon={<IconLogIn />}
              onClick={() => loginAsPartner(item)}
            >
              {' '}
              Login
            </Button>
          ) : null}
          {/* </a> */}
        </div>
      ),
    },
    {
      accessorKey: 'Data Request',
      header: 'Data Request',
      render: (item: FormData) =>
        item?.is_data_requested == 1 ? (
          <div className='flex flex-wrap gap-3'>
            <Button
              size='xs'
              disabled={item?.isAccepted || item?.isRejected}
              icon={
                item?.isAccepted ? (
                  <IconLoading />
                ) : (
                  <IconCheck className='h-5 w-5' />
                )
              }
              onClick={() => requestStatus(item, 2)}
            >
              Accept
            </Button>
            <Button
              size='xs'
              disabled={item?.isAccepted || item?.isRejected}
              variant={'destructive'}
              icon={item?.isRejected ? <IconLoading /> : <IconClose />}
              onClick={() => requestStatus(item, 3)}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  const handleSave = async (formData: FormData) => {
    const isEdit = formData?.id;
    if (formData.isError) {
      setPartnerErrors(formData.errors);
    } else {
      setSelectedPartner(null);
      setShowModal(false);
      // update user
      if (isEdit) {
        const currentPartnerIndex = parentList!!.findIndex(
          (x: any) => x.id == formData.data.id
        );
        if (currentPartnerIndex > -1) {
          let tempList = parentList as Array<object>;
          tempList[currentPartnerIndex] = formData.data;
          setParentList([...tempList]);
        }
      } else {
        fetchData();
      }
    }
  };

  const handleInputChange = (key: string, value: string | File | number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
    setPartnerErrors((prevError) => {
      return {
        ...prevError,
        [key.replace(/\[(\w+)\]/, '.$1')]: '',
      };
    });
  };

  const handleAddPartnerClick = () => {
    // Logic to open the AddPartner modal
    setSelectedPartner({});
    setShowModal(true);
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        {/* <SearchPartners onAddPartnerClick={handleAddPartnerClick} /> */}
        <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-6'>
          <div className='lg:col-span-2'>
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className='lg:col-span-2'>
            <SelectBox
              isRequired
              label=''
              options={filterPartnerType}
              value={selectedPartnerType || -1}
              onChange={(e) => handlePartnerChage(e)}
            />
          </div>
          <div className='flex gap-5 lg:col-span-2 lg:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddPartnerClick} // Call the function provided by the parent
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add Partner
            </Button>
          </div>
        </div>
        <TableComponent columns={columns} data={filterPartner} />
        {showModal && (
          <AddPartner
            open={showModal}
            data={selectedPartner}
            onSave={handleSave}
            helperData={helperData}
            formErrors={adminErrors}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setSelectedPartner(null);
              setShowModal(false);
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}
      </div>
      {loginLoader ? <Loader /> : null}
    </div>
  );
}

export default AddPartners;
