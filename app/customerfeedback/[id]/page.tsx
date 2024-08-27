'use client';
import { Button } from '@/components/ui/button';
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { apiCall, useStateCity } from '@/hooks/api';
import { useMutation } from 'react-query';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { showToast } from '@/components/Toast';
import { IconBxErrorCircle, IconCircleCheck, IconLoading } from '@/utils/Icons';
import Loader from '@/components/Loader';
import { Card } from '@/components/ui/card';
import moment from 'moment';
import Image from 'next/image';
import logoImg from '../../../public/logo.png';

const CustomerFeedback = () => {
  const pathname = usePathname();
  const apiAction = useMutation(apiCall);
  const [loading, setLoading] = useState<boolean>(true);

  const [isLoading, setisLoading] = useState(false);
  const [complaintId, setComplaintId] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');

  useEffect(() => {
    if (pathname) {
      const ids = pathname.split('/').pop();
      if (ids) {
        const [customerId, requestId, serviceReportId] = ids.split('-');
        if (customerId && requestId && serviceReportId) {
          getPartner(customerId, requestId, serviceReportId);
        }
      }
    }
  }, []);

  const getPartner = async (
    customerId: string,
    requestId: string,
    serviceReportId: string
  ) => {
    setLoading(true);
    try {
      const fetchPartner = {
        endpoint: `${API_ENDPOINTS.TECHNICIAN_FEEDBACK}customer/${customerId}/request/${requestId}/service/${serviceReportId}/partner`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchPartner);
      if (data) {
        setPartnerName(data?.name);
        setComplaintId(requestId);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (status: any) => {
    // Call confirmAccount with the current ids and feedback status
    if (pathname) {
      const ids = pathname.split('/').pop();
      if (ids) {
        const [customerId, requestId, serviceReportId] = ids.split('-');
        if (customerId && requestId && serviceReportId) {
          confirmAccount(customerId, requestId, serviceReportId, status);
        }
      }
    }
  };

  const confirmAccount = async (
    customerId: string,
    requestId: string,
    serviceReportId: string,
    feedbackStatus: string
  ) => {
    try {
      setisLoading(true);
      const fetchPartner = {
        endpoint: `${API_ENDPOINTS.TECHNICIAN_FEEDBACK}customer/${customerId}/request/${requestId}/service/${serviceReportId}/feedback?technician_feedback=${feedbackStatus}`,
        method: 'GET',
      };

      const { data, message } = await apiAction.mutateAsync(fetchPartner);
      console.log(data,'data')
      if (data) {
        showToast({
          variant: 'success',
          message: message,
          icon: <IconCircleCheck className='h-6 w-6' />,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred. Please try again.';

      showToast({
        variant: 'destructive',
        message: errorMessage,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
      setisLoading(false);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='mb-8 text-3xl font-semibold text-pbHeaderBlue'>
        {partnerName} Customer Feedback
      </h1>
      <Card className='flex  min-h-[350px] w-full max-w-[400px] flex-col  rounded-xl bg-white shadow-2xl'>
        {loading && partnerName == '' ? (
          <Loader />
        ) : (
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
              <h2 className='mb-4 text-center text-lg font-semibold'>
                Please Share your Feedback About our Service
              </h2>
              <span className='inline-flex bg-[#4ae5e54a] p-1 text-base font-semibold text-pbHeaderBlue'>
                Complaint ID - {complaintId}
              </span>
              <div className='flex items-center justify-center gap-4'>
                <Button
                  size='lg'
                  className='bg-green-500 text-green-50 transition-colors hover:bg-green-600'
                  onClick={() => handleFeedback('good')}
                  disabled={isLoading}
                  icon={
                    isLoading ? (
                      <IconLoading />
                    ) : (
                      <ThumbsUpIcon className='h-4 w-4' />
                    )
                  }
                >
                  Good
                </Button>
                <Button
                  size='lg'
                  className='bg-red-500 text-red-50 transition-colors hover:bg-red-600'
                  onClick={() => handleFeedback('bad')}
                  disabled={isLoading}
                  icon={
                    isLoading ? (
                      <IconLoading />
                    ) : (
                      <ThumbsDownIcon className='h-4 w-4' />
                    )
                  }
                >
                  Bad
                </Button>
              </div>
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

export default CustomerFeedback;
