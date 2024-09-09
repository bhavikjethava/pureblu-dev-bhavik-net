'use client';
import React from 'react';
import PreventiveService from '@/components/PreventiveService';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';

const PreventiveServicePage = () => {
  return (
    <>
      <PreventiveService apiBaseUrl={API_ENDPOINTS_PARTNER} />
    </>
  );
};

export default PreventiveServicePage;
