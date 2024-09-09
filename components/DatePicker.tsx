import { IconCalendarDays, IconClockTimeThreeOutline } from '@/utils/Icons';
import { CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatepickerProps {
  label?: string;
  dateFormat: string;
  className?: string;
  showTimeSelect?: boolean | undefined;
  disabled?: boolean;
  selectedDate?: Date | null | undefined;
  minDate?: Date | null | undefined;
  maxDate?: Date | null | undefined;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholderText?: string;
  size?: 'sm' | 'md' | 'lg'; // Add size prop to control the size of input/select
  isRequired?: boolean;
  [Key: string]: any
}

const DatepickerComponent: React.FC<DatepickerProps> = ({
  label,
  className,
  dateFormat,
  minDate,
  maxDate,
  showTimeSelect,
  selectedDate,
  disabled,
  size = 'md', // Default to 'sm' if not provided
  onChange,
  error,
  placeholderText,
  isRequired,
  ...rest
}) => {
  let heightClass = 'h-10'; // Initialize an empty string for the height class

  if (size === 'sm') {
    heightClass = 'h-8'; // Small size
  } else if (size === 'md') {
    heightClass = 'h-10'; // Medium size
  } else if (size === 'lg') {
    heightClass = 'h-12'; // Large size
  }

  return (
    <div className={`${className} `}>
      {label && (
        <div className='mb-1 block font-bold'>
          {label}
          {isRequired && <span className='text-pbRed'>*</span>}
        </div>
      )}
      <div>
        <DatePicker
          className={`${
            error ? 'border-pbRed' : ''
          } ${heightClass} flex w-full rounded-md border border-input px-3 py-2 text-sm font-normal text-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-black focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:opacity-80`}
          showTimeSelect={showTimeSelect}
          selected={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          onChange={onChange}
          dateFormat={dateFormat}
          tabIndex={-1}
          showYearDropdown
          scrollableYearDropdown
          showMonthDropdown
          placeholderText={placeholderText}
          disabled={disabled}
          showIcon
          portalId='my-popper'
          icon={<CalendarIcon className='!h-full !py-0' />}
          {...rest}
        />
        {error && <div className='mt-1 text-xs text-pbHeaderRed'>{error}</div>}{' '}
      </div>
    </div>
  );
};

export default DatepickerComponent;
