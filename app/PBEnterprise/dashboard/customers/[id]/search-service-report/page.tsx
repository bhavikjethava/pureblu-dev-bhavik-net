'use client';
import React from 'react';
import {
  API_ENDPOINTS_ENTERPRISE,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import SearchServiceReport from '@/components/Service Report/SearchServiceReport';

const SearchServiceReportPage = ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = params;
  return (
    <>
      <SearchServiceReport
        apiBaseUrl={API_ENDPOINTS_ENTERPRISE}
        customerId={id}
      />
    </>
  );
};

export default SearchServiceReportPage;
