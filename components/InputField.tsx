'use client';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { MAXPHONE, TEXTAREA } from '@/utils/utils';

interface InputFieldProps {
  label?: string;
  label2?: string;
  isRequired?: boolean;
  name?: string;
  type: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: any) => void; // Make onChange optional
  disabled?: boolean;
  error?: string | undefined; // Explicitly type the 'error' prop
  className?: string;
  size?: 'sm' | 'md' | 'lg'; // Define size options
  onSubmit?: () => void;
  focus?: boolean;
  [key: string]: unknown;
}

// InputField component
const InputField: React.FC<InputFieldProps> = ({
  label,
  label2,
  isRequired,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  className,
  name,
  size,
  focus,
  onSubmit,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (focus && inputRef.current) {
      inputRef?.current?.focus();
    }
  }, [focus]);

  useEffect(() => {
    if (error) {
      inputRef?.current?.focus();
    }
  }, [error]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      if (type != 'file') {
        if (type == 'tel') {
          const regEx = /^[0-9\b]+$/;
          if (e.target.value === '' || regEx.test(e.target.value)) {
            onChange(e.target.value);
          }
        } else {
          onChange(e.target.value);
        }
      } else {
        onChange(e);
      }
    }
  };

  const onKeyDownHandler = (e: any) => {
    if (e.key === 'Enter') {
      onSubmit?.();
    }
  };

  let heightClass = 'h-10'; // Initialize an empty string for the height class

  // Determine the height class based on the provided size value
  if (size === 'sm') {
    heightClass = 'h-8 !py-1'; // Small size
  } else if (size === 'md') {
    heightClass = 'h-10'; // Medium size
  } else if (size === 'lg') {
    heightClass = 'h-12'; // Large size
  }
  return (
    <div className={`input-field ${className}`}>
      {label && (
        <label
          htmlFor={label}
          className={`mb-2  block font-semibold ${
            label2 ? 'flex justify-between' : ''
          }`}
        >
          <span>{label}</span>
          {label2 && <span>{label2}</span>}
          {isRequired && <span className='text-pbRed'>*</span>}
        </label>
      )}
      <div>
        {type == TEXTAREA ? (
          <textarea
            name={name}
            id={label}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`flex min-h-24 w-full rounded-md border  border-input px-3 py-2 text-sm file:border-0  file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-black focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:opacity-80 ${
              error ? 'border-pbRed' : ''
            } ${heightClass}`}
            {...rest}
          />
        ) : (
          <Input
            name={name}
            ref={inputRef}
            maxLength={type == 'tel' ? MAXPHONE : undefined}
            type={type}
            id={label}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`w-full ${error ? 'border-pbRed' : ''} ${heightClass}`}
            onKeyDown={onKeyDownHandler}
            {...rest}
          />
        )}
        {error && <div className='mt-1 text-xs text-pbHeaderRed'>{error}</div>}{' '}
        {/* Display error if it exists */}
      </div>
    </div>
  );
};

export default InputField;
