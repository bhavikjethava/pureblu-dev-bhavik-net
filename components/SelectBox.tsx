import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';

interface MyCustomSelectProps<T> {
  label?: string;
  className?: string;
  options?: T[];
  onChange?: (id: any) => void;
  selectedformData?: any;
  value?: any;
  isRequired?: boolean;
  error?: string | undefined;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  optionKey?: string; // New prop to specify the key for options
  optionValue?: string; // New prop to specify the value for options
  placeholder?: string;
}

const DEFAULT_SELECTION = -1;

const SelectBox = <T,>({
  label,
  className,
  options = [],
  onChange,
  selectedformData,
  value,
  isRequired,
  error,
  disabled = false,
  size,
  optionKey = 'id', // Default key is 'id'
  optionValue = 'name', // Default value is 'name'
  placeholder,
}: MyCustomSelectProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<any>(undefined);

  // useEffect(() => {
  //   if (value === null || value === DEFAULT_SELECTION) {
  //     setSelectedValue(null);
  //     return;
  //   }
  //   const _selectedOption = options?.find((x: any) => x?.[optionKey] == value);
  //   setSelectedValue(_selectedOption);
  // }, [value, options]);

  const handleChange = (e: any) => {
    if (onChange) {
      // onChange(e?.[optionKey]);
      onChange(+e?.target?.value);
    }
  };

  let heightClass = 'h-10'; // Initialize an empty string for the height class

  if (size === 'sm') {
    heightClass = 'h-8'; // Small size
  } else if (size === 'md') {
    heightClass = 'h-10'; // Medium size
  } else if (size === 'lg') {
    heightClass = 'h-12'; // Large size
  }

  const idExists = useMemo(() => {
    return options.some((option: any) => option?.[optionKey] === DEFAULT_SELECTION);
  }, [options]);

  return (
    <div className={`input-field ${className}`}>
      {label ? (
        <div className='mb-2 block font-semibold'>
          <span>{label}</span>
          {isRequired && <span className='text-pbRed'>*</span>}
        </div>
      ) : null}
      <div className='font-medium select-wrapper'>
        {/* <Select
          options={options}
          menuPortalTarget={document?.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure the dropdown is on top
          }}
          isDisabled={disabled}
          getOptionValue={(option) => option?.[optionValue]}
          getOptionLabel={(option) => option?.[optionValue]}
          classNames={{
            control: (state: any) =>
              state.isFocused
                ? '!border-black !outline-none !shadow-none'
                : `${error ? '!border-pbRed' : ''} !border-input`,
          }}
          className={`!focus-visible:outline-none !shadow-none ${heightClass}`}
          classNamePrefix={`select${'-' + className}`}
          // value={selectedOptions} // Set the selected options
          placeholder={placeholder}
          onChange={handleChange} // Handle selection change
          value={selectedValue} // Pass selected values to the value prop
        /> */}
        {/* <label>{JSON.stringify(value)}</label> */}
        <select
          className={`custom-select w-full font-medium ${heightClass}`}
          onChange={handleChange}
          defaultValue={DEFAULT_SELECTION}
          value={value === "" ? DEFAULT_SELECTION : value}
        >
          {idExists ? null : (
            <option value={DEFAULT_SELECTION} disabled>
              {placeholder ? placeholder : 'Select...'}
            </option>
          )}
          {options?.map((reqType: any) => (
            <option key={reqType?.[optionKey]} value={reqType?.[optionKey]}>
              {reqType?.[optionValue]}
            </option>
          ))}
        </select>
        {error && <div className='mt-1 text-xs text-pbHeaderRed'>{error}</div>}{' '}
      </div>
    </div>
  );
};

export default SelectBox;
