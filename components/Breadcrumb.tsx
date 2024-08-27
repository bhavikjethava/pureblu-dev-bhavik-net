'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IconHome, IconRightArror } from '@/utils/Icons';

const Breadcrumb = () => {
  const currentPathname = usePathname();
  const pathSegments = currentPathname.split('/').filter((segment) => segment);
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerName = searchParams.get('customer');
  // const [customerName, setCustomerName] = useState('');

  const formatSegment = (segment: any) => {
    // Replace hyphens with spaces
    return segment.replace(/-/g, ' ');
  };

  // useEffect(() => {
  //   console.log(router, 'router ');
  // }, []);

  return (
    <nav
      className='flex rounded-lg border border-gray-200 bg-gray-50 px-5 py-3'
      aria-label='Breadcrumb'
    >
      <ol className='inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse'>
        <li className='inline-flex items-center space-x-2'>
          <IconHome />
          <IconRightArror className='mx-1 h-3 w-3 text-gray-400 rtl:rotate-180' />
        </li>
        {pathSegments.slice(1).map((segment, index) => {
          const isLastSegment = index === pathSegments.length - 2;
          const pathToSegment = `/${pathSegments
            .slice(0, index + 2)
            .join('/')}`;
          let formattedSegment = formatSegment(segment);

          // Replace the customer ID with customer name if it matches
          if (/^\d+$/.test(segment) && customerName) {
            formattedSegment = customerName;
          }

          return isLastSegment ? (
            <li
              key={pathToSegment}
              className='inline-flex items-center space-x-2 capitalize'
            >
              {formattedSegment}
            </li>
          ) : (
            <li
              key={pathToSegment}
              className='inline-flex items-center space-x-2 capitalize'
            >
              <Link
                href={pathToSegment}
                className='inline-flex items-center text-sm font-semibold text-blueButton-default hover:text-blue-600'
              >
                {formattedSegment}
              </Link>
              <IconRightArror className='mx-1 h-3 w-3 text-gray-400 rtl:rotate-180' />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
