'use client';
import React from 'react';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import GetUserTypeList from '@/components/GetUserType/GetUserTypeList';

function GetUserType() {
  return <GetUserTypeList apiBaseUrl={API_ENDPOINTS} />;
}

export default GetUserType;
