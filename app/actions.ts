'use server';
import ROUTES, { AUTH } from '@/utils/utils';
import { cookies } from 'next/headers';
export async function handleLogin(type: string, sessionData: string) {
  const encodedSessionData = Buffer.from(sessionData).toString('base64');
  cookies().set(type, encodedSessionData, {
    // httpOnly: true,
    // secure: true,
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function handleLogout(type: string) {
  // Clear the 'userSession' cookie
  switch (type) {
    case ROUTES.PBADMIN: {
      cookies().delete(AUTH.PBADMIN);
      break;
    }
    case ROUTES.PBPARTNER: {
      cookies().delete(AUTH.PBPARTNER);
      break;
    }
    case ROUTES.PBENTERPRISE: {
      cookies().delete(AUTH.PBENTERPRISE);
      break;
    }
    case ROUTES.ENTERPRISE: {
      cookies().delete(AUTH.ENTERPRISE);
      break;
    }
  }
}
