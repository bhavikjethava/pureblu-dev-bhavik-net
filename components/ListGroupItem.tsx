// ListGroupItem.tsx
import React, { ReactNode } from 'react';
import { Skeleton } from './ui/skeleton';

interface ListGroupItemProps {
  label?: string;
  value?: string;
  children?: ReactNode;
  className?: string;
  loading?: boolean;
}

const ListGroupItem: React.FC<ListGroupItemProps> = ({
  label,
  value,
  children,
  className,
  loading = false,
}) => (
  <div className={`flex flex-col py-4 ${className}`}>
    {loading ? (
      <>
        <dt className='mb-1 font-semibold'>{label}</dt>
        <Skeleton className='h-5 w-3/4' />{' '}
      </>
    ) : label && value ? (
      <>
        <dt className='mb-1 font-semibold'>{label}</dt>
        <dd className='font-medium'>{value}</dd>
      </>
    ) : (
      children
    )}
  </div>
);

export default ListGroupItem;
