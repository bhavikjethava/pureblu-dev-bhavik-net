'use client';
import TechnicianExportReport from '@/components/TechnicianExportReport';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React from 'react';

const TechnicianExportReportPage = () => {
  return <TechnicianExportReport apiBaseUrl={API_ENDPOINTS} isAdmin={true} />;
};

export default TechnicianExportReportPage;
