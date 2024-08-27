import React from 'react';
import CustomersList from '@/components/Customers/CustomersList';
import { API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';
import Dashboard from '@/components/Customers/Dashboard';
const page = () => {
  return (
    <>
      <Dashboard apiBaseUrl={API_ENDPOINTS_ENTERPRISE} isDashboard={true} />
    </>
  );
};

export default page;
