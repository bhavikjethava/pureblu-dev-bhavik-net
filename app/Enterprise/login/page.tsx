'use client';
import Login from '@/components/Login';
import { getClientCookie } from '@/utils/cookieUtils';
import { AUTH, DASHBOARD_ROUTE, getBaseUrl } from '@/utils/utils';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const PBAdminLogin = () => {
  return (
    <div className='flex grow items-center justify-center bg-muted'>
      <Login title='Dashboard' buttonText='Get OTP' />
    </div>
  );
};

export default PBAdminLogin;
