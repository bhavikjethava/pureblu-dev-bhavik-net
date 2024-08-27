'use client';
import Breadcrumb from '@/components/Breadcrumb';
import RestoreCustomerList from '@/components/RestoreCustomerList';
import React from 'react';

const RestoreCustomer = () => {
  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />
        <RestoreCustomerList />
      </div>
    </div>
  );
};

export default RestoreCustomer;
