import React, { FC } from 'react';
import AsyncSelect from 'react-select/async';
import { GetOptionLabel, GetOptionValue, StylesConfig } from 'react-select';

export interface OptionProps {
  value: string;
  label: string;
  getOptionLabel?: (option: OptionProps) => string;
  getOptionValue?: GetOptionValue<OptionProps>;
}

interface SelectAsyncProps {
  onSearch: (inputValue: string) => Promise<OptionProps[]>;
}

const colourStyles: StylesConfig<OptionProps> = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (styles) => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled ? undefined : 'white',
      cursor: isDisabled ? 'not-allowed' : 'default',
      color: 'black',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled
          ? isSelected
            ? '#ccc'
            : '#374ca0'
          : undefined,
      },
      ':hover': {
        backgroundColor: '#374ca0',
        color: 'white',
      },
    };
  },
};

const SelectAsync = ({ onSearch, error, ...rest }: any) => {
  return (
    <>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={(inputValue: string) => onSearch(inputValue)}
        styles={colourStyles}
        className='w-full min-w-[200px] max-w-[200px]'
        menuPortalTarget={document?.body}
        {...rest}
      />
      {error && <div className='mt-1 text-xs text-pbHeaderRed'>{error}</div>}{' '}
    </>
  );
};

export default SelectAsync;
