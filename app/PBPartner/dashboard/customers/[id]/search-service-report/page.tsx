'use client';
import React from 'react';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import SearchServiceReport from '@/components/Service Report/SearchServiceReport';
import { useRouter } from 'next/navigation'; // Import from next/navigation
import { usePathname, useSearchParams } from 'next/navigation';

const SearchServiceReportPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const searchParams = useSearchParams();
  return (
    <>
      <SearchServiceReport
        apiBaseUrl={API_ENDPOINTS_PARTNER}
        customerId={id}
      />
    </>
  );
};

export default SearchServiceReportPage;
