'use client';
import React from 'react';
import CustomersList from '@/components/Customers/CustomersList';
import {
  API_ENDPOINTS_CUSTOMERS,
  API_ENDPOINTS_ENTERPRISE,
} from '@/utils/apiConfig';
const page = () => {
  return (
    <>
      <CustomersList apiBaseUrl={API_ENDPOINTS_CUSTOMERS} />
    </>
  );
};

export default page;
