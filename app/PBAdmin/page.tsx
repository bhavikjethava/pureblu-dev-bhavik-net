'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getClientCookie } from '@/utils/cookieUtils';
import ROUTES, {
  AUTH,
  checkUserAuthorization,
  getBaseUrl,
} from '@/utils/utils';

function Home() {
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    checkAuthorizationWithoutMiddleware();
  }, []);


  const checkAuthorizationWithoutMiddleware = async () => {
    // check authentication
    let isAuthenticated = await getClientCookie(AUTH.PBPARTNER);
    const basePath = getBaseUrl(pathName);
    switch (basePath) {
      case ROUTES.PBADMIN: {
        isAuthenticated = await getClientCookie(AUTH.PBADMIN);
        break;
      }
      case ROUTES.PBPARTNER: {
        isAuthenticated = await getClientCookie(AUTH.PBPARTNER);
        break;
      }
      case ROUTES.PBENTERPRISE: {
        isAuthenticated = await getClientCookie(AUTH.PBENTERPRISE);
        break;
      }
      case ROUTES.ENTERPRISE: {
        isAuthenticated = await getClientCookie(AUTH.ENTERPRISE);
        break;
      }
    }

    checkUserAuthorization(isAuthenticated, basePath, pathName, router)
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'></main>
  );
}

export default Home;
