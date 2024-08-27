'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconAddLine } from '@/utils/Icons';
import React from 'react';

interface SearchAdminsProps {
  onAddPartnerClick: () => void; // Specify the type of onAddAdminClick
}

const SearchAdmins: React.FC<SearchAdminsProps> = ({ onAddPartnerClick }) => {
  return (
    <div className='grid w-full grid-cols-4 gap-5 py-8'>
      <div>
        <Input placeholder='Search' />
      </div>
      <div className='col-span-3 ml-auto flex gap-5'>
        <Button
          variant={'secondary'}
          className='w-full'
          onClick={onAddPartnerClick} // Call the function provided by the parent
          icon={<IconAddLine className='h-5 w-5 text-white' />}
        >
          Add Partner
        </Button>
      </div>
    </div>
  );
};

export default SearchAdmins;
