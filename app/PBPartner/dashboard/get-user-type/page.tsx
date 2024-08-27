'use client';
import React from 'react';
import GetUserTypeList from '@/components/GetUserType/GetUserTypeList';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';

function GetUserType() {
  return <GetUserTypeList apiBaseUrl={API_ENDPOINTS_PARTNER} />;
}

export default GetUserType;
