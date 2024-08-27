'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientCookie } from '@/utils/cookieUtils';
import { AUTH, FALLBACKLOGIN, FALLBACKSITE } from '@/utils/utils';

function Home() {
  const router = useRouter();

  useEffect(() => {
    // if there is no authenticated user, redirect to login page_
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    const isAuth = await getClientCookie(AUTH.PBPARTNER);
    if (isAuth) {
      router.push(FALLBACKSITE);
    } else {
      router.push(FALLBACKLOGIN);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'></main>
  );
}

export default Home;
