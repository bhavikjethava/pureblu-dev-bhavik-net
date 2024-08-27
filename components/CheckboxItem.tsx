import React from 'react';
import { Checkbox } from './ui/checkbox';

interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  ariaLabel: string;
  id: string;
  disabled?: boolean;
  tabIndex?: number;
}

const CheckboxItem: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  ariaLabel,
  id,
  disabled,
  tabIndex
}) => {
  return (
    <div className='flex items-center space-x-2'>
      <Checkbox
        id={id}
        checked={checked === true}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        tabIndex={tabIndex}
      />
      <label
        htmlFor={id}
        className='cursor-pointer text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
      >
        {ariaLabel}
      </label>
    </div>
  );
};

export default CheckboxItem;
