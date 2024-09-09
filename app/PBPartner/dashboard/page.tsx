'use client';
import React from 'react';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import Dashboard from '@/components/Customers/Dashboard';

const page = () => {
  return (
    <>
      <Dashboard apiBaseUrl={API_ENDPOINTS_PARTNER} isDashboard={true} />
    </>
  );
};

export default page;
