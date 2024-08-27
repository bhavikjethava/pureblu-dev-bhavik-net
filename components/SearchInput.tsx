// components/SearchInput.tsx
import { IconSearch } from '@/utils/Icons';
import React from 'react';
import { Input } from './ui/input';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function SearchInput({
  value,
  onChange,
  className,
  placeholder = 'Search', // Default placeholder text
  onSubmit,
  onCancel,
}: SearchInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Icon for visual indication of search */}
      <div
        className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2'
        onClick={onCancel}
      >
        <IconSearch className='h-4 w-4 text-gray-500' />
      </div>
      {/* Search input with appropriate attributes */}
      <Input
        type='search'
        id='default-search'
        className='block w-full ps-8 '
        placeholder={placeholder} // Set the placeholder dynamically
        value={value}
        onChange={handleChange}
        aria-label='Search' // Accessible label for screen readers
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default SearchInput;
