'use client';
import React from 'react';
import GetUserTypeList from '@/components/GetUserType/GetUserTypeList';
import { API_ENDPOINTS } from '@/utils/apiConfig';

function GetUserType() {
  return <GetUserTypeList apiBaseUrl={API_ENDPOINTS} />;
}

export default GetUserType;
