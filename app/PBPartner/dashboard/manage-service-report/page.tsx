'use client';
import Breadcrumb from '@/components/Breadcrumb';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import ComplaintsList from '@/components/Customers/ComplaintsList';

const ManageServiceReport = () => {
  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <Breadcrumb />
        <ComplaintsList
          apiBaseUrl={API_ENDPOINTS_PARTNER}
          isManageServiceReport={true}
        />
      </div>
    </div>
  );
};

export default ManageServiceReport;
