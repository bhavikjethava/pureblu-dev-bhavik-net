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
  <div className={`flex flex-col py-2 ${className}`}>
    {loading ? (
      <>
        <dt className='mb-1 font-bold uppercase'>{label}</dt>
        <Skeleton className='h-5 w-3/4' />{' '}
      </>
    ) : label && value ? (
      <>
        <dt className='mb-1 font-bold uppercase'>{label}</dt>
        <dd className='font-normal'>{value}</dd>
      </>
    ) : (
      children
    )}
  </div>
);

export default ListGroupItem;
