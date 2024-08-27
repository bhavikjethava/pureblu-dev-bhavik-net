'use client';
import Breadcrumb from '@/components/Breadcrumb';
import {
  API_ENDPOINTS,
  API_ENDPOINTS_ENTERPRISE,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import SparePartsReportComplaintsList from '@/components/Customers/SparePartsReportComplaintsList';

const ManageServiceReport = () => {
  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <Breadcrumb />
        <SparePartsReportComplaintsList
          apiBaseUrl={API_ENDPOINTS_ENTERPRISE}
          isSparePartsReport={true}
        />
      </div>
    </div>
  );
};

export default ManageServiceReport;
