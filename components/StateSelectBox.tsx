import React, { useContext } from 'react';
import SelectBox from './SelectBox'; // Import your existing SelectBox component
import { HELPERSDATA } from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';

type State = {
  id: number;
  name: string;
};

type StateSelectBoxProps = {
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  isRequired?: boolean;
  label?: any;
  size?: any;
};

const StateSelectBox: React.FC<StateSelectBoxProps> = ({
  value,
  onChange,
  error,
  isRequired = false,
  label,
  size,
}) => {
  const { state } = useContext(DataContext);

  return (
    <SelectBox
      label={label}
      options={state?.[HELPERSDATA]?.state}
      value={value}
      onChange={onChange}
      error={error}
      isRequired={isRequired}
      size={size}
    />
  );
};

export default StateSelectBox;
