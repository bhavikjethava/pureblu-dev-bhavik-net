'use client';
import { downloadFile } from '@/hooks/api';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { useParams, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import Loader from '@/components/Loader';
import { LogoImg } from '@/components/Logo';
import moment from 'moment';
import Image from 'next/image';
import logoImg from '../../../public/logo.png';

const CustomerReportDownload = () => {
  const { id } = useParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiAction = useMutation(apiCall);

  const downloadServiceReport = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const endpoint = `${API_ENDPOINTS_PARTNER.PARTNER_CUSTOMER_REPORT_DOWNLOAD}?reports_download_token=${id}`;

      const blob: Blob = await downloadFile(endpoint, 'application/zip', true);

      const blobUrl: string = window.URL.createObjectURL(blob);

      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = `partner-customer-reports.zip`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(blobUrl);
      setSuccess(true);
    } catch (error: any) {
      console.log(error.message, 'error');
      setError(error.message);
      // Handle error gracefully (e.g., display a message to the user)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      downloadServiceReport();
    }
  }, [id]);

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <Card className='flex h-full max-h-[350px] min-h-[350px] w-full max-w-[400px] flex-col gap-5 rounded-xl bg-white shadow-2xl'>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className='flex grow flex-col items-center justify-center text-center'>
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
              {error ? (
                <h2 className='text-lg font-semibold text-pbHeaderRed'>
                  {error}
                </h2>
              ) : (
                <p className='text-lg font-semibold text-black'>
                  Download successfully!
                </p>
              )}
            </div>
          </>
        )}
      </Card>
      <p className='m-0 p-6 font-semibold text-pbHeaderBlue'>
        Pureblu Technologies Pvt. Ltd. © {moment().format('YYYY')}
      </p>
    </div>
  );
};

export default CustomerReportDownload;
