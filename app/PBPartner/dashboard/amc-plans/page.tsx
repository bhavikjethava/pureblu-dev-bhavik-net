'use client';
import AMCList from '@/components/AMC/AMCList';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React from 'react';

const AMCPlan = () => {
  return <AMCList apiBaseUrl={API_ENDPOINTS_PARTNER} />;
};

export default AMCPlan;
