'use client';
import { TriangleAlertIcon } from '@/utils/Icons';
import { getBaseUrl } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NotFound = () => {
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-md text-center'>
        <TriangleAlertIcon className='mx-auto h-12 w-12' />
        <h1 className='mt-4 text-6xl font-bold tracking-tight text-foreground sm:text-9xl'>
          404
        </h1>
        <p className='mt-4 text-lg text-muted-foreground'>
          Oops, the page you are looking for could not be found.
        </p>
        <div className='mt-6'>
          <Link
            href={`/${basePath}/dashboard`}
            className='inline-flex items-center rounded-md bg-pbHeaderBlue px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            prefetch={false}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
