'use client';
import React, { useContext, useEffect, useState } from 'react';
import TableComponent from '@/components/Table';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import SearchInput from '@/components/SearchInput';
import ROUTES, { CUSTOMER, getBaseUrl, getVIPStatus } from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface GetCustomersColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

interface UserTypes {
  [key: string]: any;
}

function PartnerDetailCustomerList({ apiBaseUrl }: any) {
  // const [itemList, setitemList] = useState<UserTypes | undefined>();
  const apiAction = useMutation(apiCall);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredItemData, setfilteredItemData] = useState<UserTypes[]>();
  const [customerList, setCustomerList] = useState<UserTypes[]>();
  const { state, setData } = useContext(DataContext);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false); // Track whether search has been performed
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isPBenterPrise = basePath == ROUTES.PBENTERPRISE;
  const router = useRouter();

  const searchCustomers = async () => {
    try {
      setFetchLoading(true);

      const apiData = {
        endpoint: `${apiBaseUrl.CUSTOMERS}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      setfilteredItemData(() => data);
      setCustomerList(data);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    // Filter data based on the search term
    const filteredData = customerList?.filter((item: any) => {
      return Object.values(item as { [key: string]: unknown }).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setfilteredItemData(filteredData || undefined);
  }, [searchTerm]); // Add searchTerm and itemList as dependencies

  useEffect(() => {
    searchCustomers();
  }, []);

  const columns: GetCustomersColumn[] = [
    {
      accessorKey: 'is_vip',
      header: 'VIP',
      className: 'max-w-[150px]',
      render: (item: any) => (
        <span className='text-pbHeaderBlue'>{getVIPStatus(item?.is_vip)}</span>
      ),
    },

    {
      accessorKey: 'name',
      header: 'Name',
      render: (item: any) => (
        <div>
          {isPBAdmin ? (
            <span className='font-bold'>{item?.name}</span>
          ) : (
            <div>
              <Link
                href={`/${basePath}/dashboard/${ROUTES.CUSTOMERS}/${item.id}`}
                className='flex font-bold text-blueButton-default'
                onClick={(e) => {
                  e.preventDefault();
                  setData({ [CUSTOMER]: item });
                  router.push(
                    `/${basePath}/dashboard/${ROUTES.CUSTOMERS}/${item.id}`
                  );
                }}
              >
                {item?.name}
              </Link>
            </div>
          )}
        </div>
      ),
    },

    {
      accessorKey: 'phone',
      header: 'Contact',
      render: (item: any) => (
        <div>
          <span className='block  '>{item?.phone}</span>
          {item?.branch && (
            <div className='w-full py-2 font-bold'>
              <span>Branch Contact:- </span>
              <span> {item?.branch[0]?.phone}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col gap-5 p-6'>
      <div className='flex h-full flex-col gap-5 lg:gap-5'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search'
        />

        <div className='relative flex flex-1 flex-col overflow-auto bg-white'>
          <TableComponent
            columns={columns}
            data={filteredItemData}
            searchTerm={searchPerformed}
          />
        </div>
      </div>

      {/* {fetchLoading ? <Loader /> : null} */}
    </div>
  );
}

export default PartnerDetailCustomerList;
