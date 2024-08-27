'use client';
import Breadcrumb from '@/components/Breadcrumb';
import {
  API_ENDPOINTS,
  API_ENDPOINTS_CUSTOMERS,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import ComplaintsList from '@/components/Customers/ComplaintsList';
import SearchInput from '@/components/SearchInput';
import Link from 'next/link';
import { IconBxErrorCircle, IconExternalLink, IconSearch } from '@/utils/Icons';
import SelectBox from '@/components/SelectBox';
import ROUTES, { OptionType, getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import InputField from '@/components/InputField';
import DatepickerComponent from '@/components/DatePicker';
import { showToast } from '@/components/Toast';
import useFetchComplaints from '@/hooks/useFetchComplaints';
import { Button } from '@/components/ui/button';

const ManageServiceReport = () => {
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);

  const [searchData, setSearchData] = useState<{ [Key: string]: any }>({
    search: '',
    from: null,
    to: null,
  });

  const options = {
    searchData: searchData,
    isManageServiceReport: true,
  };
  const { complaintList, fetchComplaints, updateComplaintList } =
    useFetchComplaints(API_ENDPOINTS_CUSTOMERS, options);

  const onSearchClcik = () => {
    const { search } = searchData;
    if (search && search.length > 2) {
      fetchComplaints();
    } else {
      showToast({
        variant: 'destructive',
        message: 'Please enter minimum 3 character to search',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    }
  };

  const onSearchChangeHandler = (field: string, value: any) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <Breadcrumb />
        {/* <ComplaintsList
          apiBaseUrl={API_ENDPOINTS_CUSTOMERS}
          isManageServiceReport={true}
        /> */}
        <div className='grid w-full grid-cols-12 items-center gap-5 bg-white p-5'>
          <div className='col-span-10'>
            <InputField
              type='text'
              label=''
              placeholder='Name or User Id'
              value={searchData?.search}
              onSubmit={onSearchClcik}
              onChange={(e) => onSearchChangeHandler('search', e)}
            />
          </div>
          <div className='col-span-2 flex gap-5'>
            <Button
              variant={'blue'}
              className='!w-full'
              onClick={onSearchClcik}
              icon={<IconSearch />}
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageServiceReport;
