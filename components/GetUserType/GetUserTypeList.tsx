'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconBxErrorCircle, IconSearch } from '@/utils/Icons';

import TableComponent from '@/components/Table';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import SearchInput from '@/components/SearchInput';
import { showToast } from '@/components/Toast';

interface GetUserTypeColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

interface UserTypes {
  [key: string]: any;
}

function GetUserTypeList({ apiBaseUrl }: any) {
  const [itemList, setitemList] = useState<UserTypes | undefined>({ data: [] });
  const [isLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchGetUserType = async () => {
    try {
      if (!searchTerm || searchTerm?.length < 3) {
        // Show an alert with the error message
        showToast({
          variant: 'destructive',
          message: 'Please enter minimum 3 character to search',
          icon: <IconBxErrorCircle className='h-6 w-6' />,
        });
        return; // Stop execution if no search term is entered
      }
      setLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.GET_USER_TYPE}?search=${searchTerm}`,
        method: 'GET',
      };
      setitemList(undefined);
      const response = await apiAction.mutateAsync(data);
      setLoading(false);
      setitemList(() => ({
        ...response,
      }));
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const columns: GetUserTypeColumn[] = [
    {
      accessorKey: 'id',
      header: '',
      className: 'max-w-[100px]',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      className: 'min-w-[200px]',
    },
    { accessorKey: 'phone', header: 'Contact' },
    // { accessorKey: 'phone', header: 'Contact' },
    {
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'partner',
      header: 'Partner',
    },
    {
      accessorKey: 'user_type',
      header: 'Type',
      className: 'max-w-[120px]',
    },
  ];

  const handleSearchButtonClick = () => {
    if (!isLoading) fetchGetUserType(); // Call the fetchGetUserType function when the button is clicked
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-9'>
          <div className='lg:col-span-7'>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={handleSearchButtonClick}
              placeholder='Name (Min 3 character) or Contact no (full) or EmailID or User Id'
            />
          </div>

          <div className='flex gap-5 lg:col-span-2'>
            <Button
              variant={'blue'}
              disabled={isLoading}
              className='!w-full'
              onClick={handleSearchButtonClick} // Call handleSearchButtonClick when the button is clicked
              icon={<IconSearch className='h-4 w-4 text-white' />}
            >
              Search Record
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={itemList?.data} />
      </div>
    </div>
  );
}

export default GetUserTypeList;
