import React, { useState } from 'react';
import Select, { ActionMeta } from 'react-select';
import makeAnimated from 'react-select/animated';

interface Option {
  [key: string]: any;
}

interface Props {
  options: Option[];
  label?: string;
  className?: string;
  error?: any;
  value?: any; // Add value prop for selected values
  onChange: any; // Change the onChange callback signature
  getOptionValue: (option: Option) => any; // Prop for getOptionValue function
  getOptionLabel: (option: Option) => any; // Prop for getOptionLabel function
  isMulti?: boolean; // Prop for isMulti with a default values
  closeMenuOnSelect?: boolean;
  isRequired?: boolean;
  [Key: string]: any;
}

const MultiSelectDropdown: React.FC<Props> = ({
  options,
  label,
  onChange,
  className,
  value, // Access value prop
  error,
  getOptionValue, // Access getOptionValue prop
  getOptionLabel, // Access getOptionLabel prop
  isMulti = true, // Default value for isMulti is true
  closeMenuOnSelect = false,
  isRequired = false,
  ...rest
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const animatedComponents = makeAnimated();

  // const getOptionValue = (option: Option): any => option.id;
  // const getOptionLabel = (option: Option): any => option.name;

  // Handle change event
  const handleSelectChange = (
    newValue: any,
    actionMeta: ActionMeta<Option>
  ) => {
    onChange(newValue ? newValue : []); // Pass newValue directly to onChange
  };

  return (
    <div>
      {label ? (
        <div className='mb-2 block font-semibold'>
          <span>{label}</span>
          {isRequired && <span className='text-pbRed'>*</span>}
        </div>
      ) : null}
      <div className='font-medium min-w-48'>
        <Select
          isMulti={isMulti} // Use isMulti prop
          closeMenuOnSelect={closeMenuOnSelect}
          components={animatedComponents}
          options={options}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          menuPortalTarget={document.body}
          // menuIsOpen={true}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure the dropdown is on top
          }}
          classNames={{
            control: (state) =>
              state.isFocused
                ? '!border-black !outline-none !shadow-none'
                : `${error ? '!border-pbRed' : ''} !border-input`,
          }}
          className={`!focus-visible:outline-none !shadow-none ${className}`}
          classNamePrefix={`select${'-'+className}`}
          // value={selectedOptions} // Set the selected options
          onChange={handleSelectChange} // Handle selection change
          value={value} // Pass selected values to the value prop
          {...rest}
        />
        {error && <div className='mt-1 text-xs text-pbHeaderRed'>{error}</div>}{' '}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
