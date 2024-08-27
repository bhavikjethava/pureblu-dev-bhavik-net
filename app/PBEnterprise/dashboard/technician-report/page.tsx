import TechnicianExportReport from '@/components/TechnicianExportReport';
import {
  API_ENDPOINTS_ENTERPRISE,
  API_ENDPOINTS_PARTNER,
} from '@/utils/apiConfig';
import React from 'react';

const TechnicianExportReportPage = () => {
  return <TechnicianExportReport apiBaseUrl={API_ENDPOINTS_ENTERPRISE} isEnterprise={true}/>;
};

export default TechnicianExportReportPage;
