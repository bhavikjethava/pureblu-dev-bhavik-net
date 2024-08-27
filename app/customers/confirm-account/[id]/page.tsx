'use client';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useParams, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { LogoImg } from '@/components/Logo';
import { Card } from '@/components/ui/card';
import moment from 'moment';
import Loader from '@/components/Loader';
import Image from 'next/image';
import logoImg from '@/public/logo.png';

const Page = () => {
  const { id } = useParams();
  const apiAction = useMutation(apiCall);
  const [message, setMessage] = useState('Activating account...');
  const [isError, setIsError] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const confirmAccount = async () => {
      setLoading(true);
      try {
        const fetchPartner = {
          endpoint: `${API_ENDPOINTS.CONFIRM_ACCOUNT}?confirm_token=${id}`,
          method: 'GET',
        };

        const { data } = await apiAction.mutateAsync(fetchPartner);
        if (data) {
          setMessage('Your account is now active and ready to use.');
          setIsError(false);
        } else {
          setMessage('Account activation failed. Please try again.');
          setIsError(true);
        }
      } catch (error) {
        setMessage('Failed to fetch resource. Please try again later.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      confirmAccount();
    }
  }, [id]);

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <Card className='flex h-full max-h-[350px] min-h-[350px] w-full max-w-[400px] flex-col gap-5 rounded-xl bg-white shadow-2xl'>
        {isLoading ? (
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
              {isError ? (
                <h2 className='text-lg font-semibold text-pbHeaderRed'>
                  Account Activation Failed.
                </h2>
              ) : (
                <p className='text-lg font-semibold text-black'>
                  Account Activated.
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

export default Page;
{
  /* <Card className='w-full max-w-lg space-y-4 p-6 min-h-96'>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className='mb-10 text-center'>
              <div className='mb-5 flex items-center justify-center'>
                <LogoImg alt='Pureblu Logo' />
              </div>
              <h2 className='mb-2 text-2xl font-bold'>
                {isError ? 'Account Activation Failed' : 'Account Activated'}
              </h2>
              <p className='text-muted-foreground'>{message}</p>
            </div>
            <div className='border-t pt-5 text-center'>
              <p>Pureblu Technologies Pvt. Ltd. © {moment().format('YYYY')}</p>
            </div>
          </>
        )}
      </Card> */
}
