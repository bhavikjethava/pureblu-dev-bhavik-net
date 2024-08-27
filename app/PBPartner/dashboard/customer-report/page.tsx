'use client';
import Breadcrumb from '@/components/Breadcrumb';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { apiCall, downloadFile } from '@/hooks/api';
import { IconCircleCheck, IconLoading } from '@/utils/Icons';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React, { useState } from 'react';
import { useMutation } from 'react-query';

const TechnicianExportReportPage = () => {
  const [isLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);

  const onCustomerReportDownload = async () => {
    try {
      setLoading(true);
      const downloadReportRequest = {
        endpoint: `${API_ENDPOINTS_PARTNER.CUSTOMER_REPORT}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(downloadReportRequest);
      if (data) {
        showToast({
          variant: 'success',
          message: data || '',
          icon: <IconCircleCheck className='h-6 w-6' />,
        });
      }
    } catch (e) {
      console.log('fail to fetch ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5 '>
        <Breadcrumb />

        <div className=' flex h-full flex-col'>
          <div>
            <Button
              onClick={onCustomerReportDownload}
              disabled={isLoading}
              icon={isLoading ? <IconLoading /> : null}
            >
              Customer Report Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianExportReportPage;
