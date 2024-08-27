'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MyCustomSelectProps {
  label?: string;
  options?: {
    id: number;
    name: string;
    phone_code: number;
    nick_name: string;
  }[];
  onChange?: (id: number) => void;
  value?: any;
  isRequired?: boolean;
  error?: string | undefined; // Explicitly type the 'error' prop
  size?: 'sm' | 'md' | 'lg'; // Define size options
}

const CountrySelectBox: React.FC<MyCustomSelectProps> = ({
  label,
  options,
  onChange,
  value,
  isRequired,
  error,
  size,
}) => {
  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e);
    }
  };
  let heightClass = 'h-10'; // Initialize an empty string for the height class

  // Determine the height class based on the provided size value
  if (size === 'sm') {
    heightClass = 'h-8'; // Small size
  } else if (size === 'md') {
    heightClass = 'h-10'; // Medium size
  } else if (size === 'lg') {
    heightClass = 'h-12'; // Large size
  }
  return (
    <div className='select-field'>
      {label && (
        <label htmlFor={label} className='mb-2 block font-semibold'>
          {label}
          {isRequired && <span className='text-pbRed'>*</span>}
        </label>
      )}
      <Select defaultValue={value?.toString()} onValueChange={handleChange}>
        <SelectTrigger
          className={`${error ? 'border-pbRed' : ''} ${heightClass}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options &&
            options.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {`(+${option?.phone_code}) ${option.nick_name}`}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && <div className='mt-1 text-xs text-pbHeaderRed'>{error}</div>}{' '}
    </div>
  );
};

export default CountrySelectBox;
