import React from 'react';
import PreventiveService from '@/components/PreventiveService';
import { API_ENDPOINTS } from '@/utils/apiConfig';

const PreventiveServicePage = () => {
  return (
    <>
      <PreventiveService apiBaseUrl={API_ENDPOINTS} />
    </>
  );
};

export default PreventiveServicePage;
