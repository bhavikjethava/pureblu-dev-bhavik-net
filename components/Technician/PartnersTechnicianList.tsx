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
const PartnersTechnicianList: FC<TechnicianListProps> = ({ apiBaseUrl }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setselectedItem] = useState<UserTypes>();
  const [showModal, setshowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredItemData, setfilteredItemData] = useState<UserTypes[]>();
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false); // Track whether search has been performed
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

  const { technicianList, updateTechnicianList, activeTechnician } =
    useFetchTechnician(apiBaseUrl);

  useEffect(() => {
    // Filter data based on the search term
    const filteredItemData = technicianList?.filter((item: any) => {
      return Object.values(item as { [key: string]: unknown }).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setfilteredItemData(filteredItemData || undefined);
  }, [searchTerm, technicianList]); // Add searchTerm and itemList as dependencies

  const handleTechnicianTypeChage = (technicianTypeId: number) => {
    if (technicianTypeId > 0) {
      const filterData = technicianList?.filter((item: any) => {
        const keyValues = item['status'];
        const technicianTypeIdString = String(technicianTypeId);
        if (keyValues !== undefined) {
          return String(keyValues) === technicianTypeIdString;
        }
        return false;
      });
      setfilteredItemData(filterData);
    } else {
      setfilteredItemData(technicianList);
    }
  };

  const columns: TechnicianColumn[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      className: 'min-w-[200px]',
      render: (item: any) => (
        <Link
          href={`/${basePath}/dashboard/${ROUTES.TECHNICIANS}/${item.id}`}
          className='flex font-bold text-blueButton-default'
          onClick={(e) => {
            e.preventDefault();
            setData({ technician: item });
            router.push(
              `/${basePath}/dashboard/${ROUTES.TECHNICIANS}/${item.id}`
            );
          }}
        >
          {item?.name}
        </Link>
      ),
    },
    { accessorKey: 'phone', header: 'Contact' },
  ];

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col gap-5 p-6'>
      <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-9'>
        <div className='lg:col-span-3'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search'
          />
        </div>
        <div className='lg:col-span-3'>
          <SelectBox
            options={availableList}
            value={0}
            onChange={(e) => handleTechnicianTypeChage(e)}
          />
        </div>
        <div className='flex gap-5 lg:col-span-3'></div>
      </div>

      <div className='relative flex flex-1 flex-col overflow-auto bg-white'>
        {
          <TableComponent
            columns={columns}
            data={filteredItemData}
            searchTerm={false}
          />
        }
      </div>

      {/* {isLoadTechnicianInfo ? <Loader /> : null} */}
    </div>
  );
};

export default PartnersTechnicianList;
