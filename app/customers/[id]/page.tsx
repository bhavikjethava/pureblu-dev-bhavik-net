'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { downloadFile } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { IconDownload } from '@/utils/Icons';
import { Card } from '@/components/ui/card';
import Loader from '@/components/Loader';
import Image from 'next/image';
import logoImg from '../../../public/logo.png';
import moment from 'moment';

const Customers: React.FC = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const downloadServiceReport = async (
    customerId: string,
    requestId: string,
    serviceReportId: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const endpoint = `${API_ENDPOINTS_PARTNER.WEB_SERVICE_REPORT}/customer/${customerId}/request/${requestId}/service/${serviceReportId}/download`;

      const blob: Blob = await downloadFile(endpoint, null, true);

      const blobUrl: string = window.URL.createObjectURL(blob);

      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = `service-report-${customerId}-${requestId}-${serviceReportId}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(blobUrl);
      setSuccess(true);
      window.close();
    } catch (error) {
      setError('Failed to download service report. Please try again.');
      // Handle error gracefully (e.g., display a message to the user)
    } finally {
      window.close();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pathname) {
      const ids = pathname.split('/').pop();
      if (ids) {
        const [customerId, requestId, serviceReportId] = ids.split('-');

        if (customerId && requestId && serviceReportId) {
          // Trigger the download function with the extracted IDs
          downloadServiceReport(customerId, requestId, serviceReportId);
        }
      }
    }
  }, [pathname]);

  const handleRetry = () => {
    if (pathname) {
      const ids = pathname.split('/').pop();
      if (ids) {
        const [customerId, requestId, serviceReportId] = ids.split('-');
        if (customerId && requestId && serviceReportId) {
          downloadServiceReport(customerId, requestId, serviceReportId);
        }
      }
    }
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <Card className='flex  min-h-[350px] w-full max-w-[400px] flex-col  rounded-xl bg-white shadow-2xl'>
        {/* {loading ? (
          <Loader />
        ) : ( */}
        <>
          <div className='flex grow flex-col items-center justify-center gap-4 p-8 text-center'>
            <div className='mb-5 flex items-center justify-center'>
              <Image
                src={logoImg}
                alt={'PureBlu'}
                height={160}
                width={160}
                priority // or priority={true}
                className='max-w-24 rounded-sm'
              />
            </div>
            {loading ? (
              <div className='flex flex-col items-center'>
                <Loader />
                <p className='mt-4 text-lg font-semibold text-black'>
                  Loading...
                </p>
              </div>
            ) : (
              <>
                {error ? (
                  <h2 className='text-lg font-semibold text-pbHeaderRed'>
                    {error}
                  </h2>
                ) : (
                  <p className='text-lg font-semibold text-black'>
                    Download successfully!
                  </p>
                )}
              </>
            )}
          </div>
        </>
        {/* )} */}
      </Card>
      <p className='m-0 p-6 font-semibold text-pbHeaderBlue'>
        Pureblu Technologies Pvt. Ltd. © {moment().format('YYYY')}
      </p>
    </div>
  );
};

export default Customers;
