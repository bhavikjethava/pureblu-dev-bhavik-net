import AdminReportList from '@/components/AdminReportList';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React from 'react';

const TechnicianExportReportPage = () => {
  return <AdminReportList apiBaseUrl={API_ENDPOINTS} isAdmin={true} />;
};

export default TechnicianExportReportPage;
