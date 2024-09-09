'use client';
import AdminReportList from '@/components/AdminReportList';
import { API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';
import React from 'react';

const TechnicianExportReportPage = () => {
  return <AdminReportList apiBaseUrl={API_ENDPOINTS_ENTERPRISE} />;
};

export default TechnicianExportReportPage;
