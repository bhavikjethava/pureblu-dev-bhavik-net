'use client';
import React from 'react';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import AMCList from '@/components/AMC/AMCList';

function ManageAmc() {
  return <AMCList apiBaseUrl={API_ENDPOINTS} />;
}

export default ManageAmc;
