'use client';
import React from 'react';
import {
  API_ENDPOINTS_CUSTOMERS,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import SearchServiceReport from '@/components/Service Report/SearchServiceReport';

const SearchServiceReportPage = ({
  params,
}: {
  params: { customerId: string };
}) => {
  const { customerId } = params;
  return (
    <>
      <SearchServiceReport
        apiBaseUrl={API_ENDPOINTS_CUSTOMERS}
        customerId={customerId}
      />
    </>
  );
};

export default SearchServiceReportPage;
