'use client';
import AdminReportList from '@/components/AdminReportList';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React from 'react';

const TechnicianExportReportPage = () => {
  return <AdminReportList apiBaseUrl={API_ENDPOINTS_PARTNER} />;
};

export default TechnicianExportReportPage;
