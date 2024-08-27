import React from 'react';
import { Button } from './ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  isLoading: boolean,
  onPrevious: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  perPage,
  onPrevious,
  onNext,
  isLoading
}) => {
  const startEntry = (currentPage - 1) * perPage + 1;
  const endEntry = Math.min(currentPage * perPage, totalPages);
  return (
    <nav className='mt-auto flex items-center justify-between gap-4 rounded-md border-t bg-white p-4'>
      <div>
        <span className='text-sm text-gray-700 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-900 dark:text-white'>
            {startEntry}
          </span>{' '}
          to{' '}
          <span className='font-semibold text-gray-900 dark:text-white'>
            {endEntry}
          </span>{' '}
          of{' '}
          <span className='font-semibold text-gray-900 dark:text-white'>
            {totalPages}
          </span>{' '}
          Entries
        </span>
      </div>
      <div className='flex gap-4'>
        {currentPage !== 1 && (
          <Button variant={'outline'} size={'sm'} onClick={onPrevious} disabled={isLoading}>
            Previous
          </Button>
        )}
        {totalPages / perPage > currentPage && totalPages > perPage && (
          <Button variant={'outline'} size={'sm'} onClick={onNext} disabled={isLoading}>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Pagination;
