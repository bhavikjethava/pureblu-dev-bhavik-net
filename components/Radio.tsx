import React from 'react';

interface RadioProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  name: string;
}

const Radio: React.FC<RadioProps> = ({
  checked,
  onCheckedChange,
  ariaLabel,
  name,
}) => {
  return (
    <label className='inline-flex cursor-pointer items-center'>
      <input
        type='radio'
        className='form-radio h-4 w-4 cursor-pointer text-blue-500'
        checked={checked === true}
        onChange={(e) => onCheckedChange(e.target.checked)}
        aria-label={ariaLabel}
        name={name}
      />
      <span className='ml-2 cursor-pointer text-gray-700'>{ariaLabel}</span>
    </label>
  );
};

export default Radio;
