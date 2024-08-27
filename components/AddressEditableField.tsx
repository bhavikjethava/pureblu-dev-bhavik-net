// AddressField.tsx
import React, { useContext, useEffect, useState } from 'react';
import InputField from './InputField';
import SelectBox from './SelectBox';
import CountrySelectBox from './CountrySelectBox';
import { DataContext } from '@/context/dataProvider';
import { HELPERSDATA } from '@/utils/utils';
import { Skeleton } from './ui/skeleton';
import StateSelectBox from './StateSelectBox';

interface AddressFieldProps {
  label: string;
  editMode?: boolean;
  selectedformData: any;
  handleInputChange?: (key: string, value: any) => void;
  handleStateChange?: (key: string, value: any) => void;
  cityList?: { id: number; name: string }[];
  errors?: any;
  loading?: boolean;
}

const AddressField: React.FC<AddressFieldProps> = ({
  label,
  editMode,
  selectedformData,
  handleInputChange,
  handleStateChange,
  cityList,
  errors,
  loading = false,
}) => {
  const [helperData, setHelperData] = useState<{ data?: any }>({});
  const { state } = useContext(DataContext);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      const data = state[HELPERSDATA]; // Access state[HELPERSDATA] directly
      setHelperData((pre: any) => {
        return {
          ...pre,
          data: data, // Assign data directly, avoiding 'never' type
        };
      });
    }
  }, [state]);
  return (
    <>
      <dt className='mb-1  font-semibold'>{label}</dt>
      <div className='flex flex-col gap-1 capitalize'>
        {loading ? (
          // Render skeleton loader when loading is true
          <>
            <Skeleton className='h-4 w-3/4' />{' '}
            <Skeleton className='h-4 w-3/4' />{' '}
            <Skeleton className='h-4 w-3/4' />{' '}
            <Skeleton className='h-4 w-3/4' />{' '}
            <Skeleton className='h-4 w-3/4' />{' '}
          </>
        ) : editMode ? (
          <>
            <InputField
              type='text'
              isRequired
              placeholder='Address 1'
              // label='Address 1'
              value={selectedformData?.address_1 || ''}
              onChange={(e) =>
                handleInputChange && handleInputChange('address_1', e)
              }
              size='sm'
              error={errors?.address_1 || ''}
            />
            <InputField
              type='text'
              placeholder='Address 2'
              // label='Address 2'
              value={selectedformData?.address_2 || ''}
              onChange={(e) =>
                handleInputChange && handleInputChange('address_2', e)
              }
              size='sm'
            />
            <InputField
              type='text'
              placeholder='Address 3'
              // label='Address 3'
              value={selectedformData?.address_3 || ''}
              onChange={(e) =>
                handleInputChange && handleInputChange('address_3', e)
              }
              size='sm'
            />

            <InputField
              type='text'
              placeholder='Locality'
              // label='Address 3'
              value={selectedformData?.locality || ''}
              onChange={(e) =>
                handleInputChange && handleInputChange('locality', e)
              }
              size='sm'
            />

            <StateSelectBox
              value={selectedformData.state_id || ''}
              onChange={(e) =>
                handleStateChange && handleStateChange('state_id', Number(e))
              }
              size='sm'
              error={errors?.state_id || ''}
            />
            <SelectBox
              isRequired
              // label='City'
              options={cityList}
              value={selectedformData?.city_id || ''}
              onChange={(e) =>
                handleInputChange && handleInputChange('city_id', Number(e))
              }
              size='sm'
              error={errors?.city_id || ''}
            />
            <InputField
              type='text'
              isRequired
              placeholder='Zip'
              value={selectedformData?.zip || ''}
              onChange={(e) => handleInputChange && handleInputChange('zip', e)}
              size='sm'
              error={errors?.zip || ''}
            />
          </>
        ) : (
          <>
            {selectedformData?.address_1 && (
              <p className='font-medium'>{selectedformData?.address_1},</p>
            )}
            {selectedformData?.address_2 && (
              <p className='font-medium'>{selectedformData?.address_2},</p>
            )}
            {selectedformData?.address_3 && (
              <p className='font-medium'>{selectedformData?.address_3},</p>
            )}
             {selectedformData?.locality && (
              <p className='font-medium'>{selectedformData?.locality},</p>
            )}
            {selectedformData?.state?.name && (
              <p className='font-medium'>{selectedformData?.state?.name},</p>
            )}
            {(selectedformData?.city?.name || selectedformData?.zip) && (
              <p className='font-medium'>
                {selectedformData?.city?.name
                  ? selectedformData?.city?.name
                  : ''}
                {selectedformData?.zip ? ` - ${selectedformData?.zip}` : ''}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AddressField;
