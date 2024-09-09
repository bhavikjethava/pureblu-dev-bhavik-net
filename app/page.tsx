'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getClientCookie } from '@/utils/cookieUtils';
import ROUTES, { AUTH, DASHBOARD_ROUTE, FALLBACKLOGIN, FALLBACKSITE } from '@/utils/utils';

function Home() {
  const router = useRouter();

  useEffect(() => {
    // if there is no authenticated user, redirect to login page_
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    const isAuth = await getClientCookie(AUTH.PBPARTNER);
    if (isAuth) {
      // router.push(FALLBACKSITE);
      router.push(`/${ROUTES.PBPARTNER}/${DASHBOARD_ROUTE}`);
    } else {
      router.push(FALLBACKLOGIN);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'></main>
  );
}

export default Home;
