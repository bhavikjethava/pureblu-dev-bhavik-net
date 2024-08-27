// components/StatusButtonGroup.tsx
import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust import path as needed

interface StatusButtonGroupProps {
  counts: {
    upcoming: number;
    allocatingTechnician: number;
    ongoing: number;
    past: number;
  };
}

const StatusButtonGroup: React.FC<StatusButtonGroupProps> = ({ counts }) => {
  return (
    <div className='ml-auto flex max-w-xl gap-5'>
      <Button variant='secondary' className='!w-full' size='sm'>
        Upcoming{' '}
        <span className='mx-1 flex h-5 w-5 items-center justify-center rounded-full bg-white p-1 text-secondary'>
          {counts.upcoming}
        </span>
      </Button>
      <Button variant='yellow' className='!w-full' size='sm'>
        Allocating Technician{' '}
        <span className='mx-1 flex h-5 w-5 items-center justify-center rounded-full bg-white p-1 text-yellowButton-default'>
          {counts.allocatingTechnician}
        </span>
      </Button>
      <Button variant='blue' className='!w-full' size='sm'>
        Ongoing{' '}
        <span className='mx-1 flex h-5 w-5 items-center justify-center rounded-full bg-white p-1 text-blueButton-default'>
          {counts.ongoing}
        </span>
      </Button>
      <Button variant='ghost' className='!w-full bg-[#f5f5f5]' size='sm'>
        Past{' '}
        <span className='mx-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 p-1 text-white'>
          {counts.past}
        </span>
      </Button>
    </div>
  );
};

export default StatusButtonGroup;
