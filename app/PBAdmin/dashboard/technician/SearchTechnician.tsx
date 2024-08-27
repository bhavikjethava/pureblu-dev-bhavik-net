'use client';
import SelectBox from '@/components/SelectBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconAddLine, IconSearch } from '@/utils/Icons';
import React, { useState } from 'react';
import AddTechnician from '../../../../components/Technician/AddTechnician';

const SearchTechnician = () => {
  const Options = ['All', 'Available', 'UnAvailable'];
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className='grid w-full grid-cols-4 gap-5 py-8'>
      <div>
        <Input />
      </div>
      <div>{/* <SelectBox options={Options} /> */}</div>
      <div className='col-span-2 flex gap-5'>
        <Button
          className='w-full'
          icon={<IconSearch className='h-4 w-4 text-white' />}
        >
          Search Records
        </Button>
        <Button
          variant={'secondary'}
          className='w-full'
          onClick={handleOpenDialog}
          icon={<IconAddLine className='h-5 w-5 text-white' />}
        >
          Add Technician
        </Button>

        {/* <AddTechnician open={isDialogOpen} onClose={handleCloseDialog} /> */}
      </div>
    </div>
  );
};

export default SearchTechnician;
