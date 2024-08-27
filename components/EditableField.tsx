// EditableField.tsx
import React from 'react';
import InputField from './InputField';
import { Skeleton } from './ui/skeleton';
import SelectBox from './SelectBox'; // Import the SelectBox component

interface EditableFieldProps {
  label: string;
  value: string;
  selectedValue?: any;
  editMode?: boolean;
  onChange?: (value: string) => void;
  handleSelectChange?: (value: any) => void;
  error?: string;
  loading?: boolean;
  useCustomStyle?: boolean;
  size?: 'sm' | 'md' | 'lg'; // Add size prop to control the size of input/select
  type?: 'text' | 'dropdown' | 'text-area'; // Add type prop to determine the type of field
  options?: { id: number; name: string }[];
  optionKey?: any;
  optionValue?: any;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  selectedValue,
  editMode,
  onChange,
  handleSelectChange,
  error,
  loading = false,
  useCustomStyle = false,
  size = 'sm', // Default to 'sm' if not provided
  type = 'text', // Default to 'text' if not provided
  options = [], // Default to empty array if not provided
  optionKey,
  optionValue,
}) => {
  if (type === 'dropdown') {
    return (
      <div className={`grid  ${useCustomStyle ? '' : 'grid-cols-2'}`}>
        <div className='mb-1  font-semibold'>{label}</div>
        {editMode ? (
          <SelectBox
            isRequired
            // label={label} // You can uncomment this if you want to display the label inside SelectBox
            options={options}
            optionKey={optionKey} // Set the key for options
            optionValue={optionValue} // Set the value for options
            value={selectedValue}
            onChange={(e) => handleSelectChange && handleSelectChange(e)}
            size={size}
            error={error}
          />
        ) : loading ? (
          <Skeleton className='h-5 w-3/4' />
        ) : (
          <span>{value}</span>
        )}
      </div>
    );
  }

  if (useCustomStyle) {
    return (
      <div className='grid grid-cols-2'>
        <div className='text-sm  font-semibold'>{label}</div>
        {editMode ? (
          <InputField
            type={type}
            isRequired
            value={value}
            onChange={(e) => handleSelectChange && handleSelectChange(e)}
            size={size}
            error={error}
          />
        ) : loading ? (
          <Skeleton className='h-5 w-3/4' />
        ) : (
          <span className=''>{value}</span>
        )}
      </div>
    );
  }

  return (
    <>
      <dt className='mb-1  font-semibold'>{label}</dt>
      <dd className='font-medium'>
        {editMode ? (
          <InputField
            type={type}
            isRequired
            value={value}
            onChange={(e) => onChange && onChange(e)}
            size={size}
            error={error}
          />
        ) : loading ? (
          <Skeleton className='h-5 w-3/4' />
        ) : (
          <span>{value}</span>
        )}
      </dd>
    </>
  );
};

export default EditableField;
