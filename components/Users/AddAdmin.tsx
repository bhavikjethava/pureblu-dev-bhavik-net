import React, { ChangeEvent, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import SelectBox from '@/components/SelectBox';
import CheckboxItem from '@/components/CheckboxItem';
import { apiCall, useApiResource, useStateCity } from '@/hooks/api';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { IconLoading } from '@/utils/Icons';
import CountrySelectBox from '@/components/CountrySelectBox';
import { useMutation } from 'react-query';
import { usePathname } from 'next/navigation';
import ROUTES, { CITY, STATE, getBaseUrl } from '@/utils/utils';
import StateSelectBox from '../StateSelectBox';

interface AddAdminProps {
  open: boolean;
  onClose?: () => void;
  selectedData?: any;
  helperData?: any;
  onSave?: (newData: any) => void;
  onInputChange?: (key: string, value: any) => void;
  formErrors?: { [key: string]: string };
  loading?: boolean;
}

interface FormData {
  [key: string]: any;
}

const AddAdmin: React.FC<AddAdminProps> = ({
  open,
  onClose,
  selectedData,
  helperData,
  onSave,
  onInputChange,
  loading,
  formErrors = {}, // Default value for errors
}) => {
  // React State: Form data state and function to update it
  const [selectedformData, setselectedFormData] = useState<FormData>({
    ...selectedData,
  });
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const { stateList, cityList, setStateList, setCityList, fetchRequest } =
    useStateCity();

  useEffect(() => {
    if (selectedData) {
      // setStateList(selectedData.allState);
      setCityList(selectedData.allCity);
    }
    if (selectedData?.country_id) {
      fetchRequest(STATE, selectedData.country_id);
    }
    if (selectedData?.state_id) {
      fetchRequest(CITY, selectedData.state_id);
    }
  }, []);

  const handleSave = async () => {
    if (onSave) {
      await onSave(selectedformData);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    onInputChange?.(key, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleCountryChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    setStateList([]);
    setCityList([]);
    onInputChange?.('state_id', null);
    onInputChange?.('city_id', null);
    fetchRequest(STATE, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleStateChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    onInputChange?.('city_id', null);
    fetchRequest(CITY, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  // React Component: Render the UI
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Admins'
      ClassName='sm:max-w-lg h-full grow max-h-[70%]'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: handleSave,
          btnLoading: loading,
          icon: loading ? <IconLoading /> : '',
        },
      ]}
    >
      <ScrollArea className='grow'>
        <div className='flex grow flex-col overflow-auto p-4'>
          <div className='grid grid-cols-2 gap-4'>
            {/* Input fields with labels, values, change handlers, and error messages */}
            {isPBPartner ? (
              <>
                <InputField
                  type='text'
                  isRequired
                  label='First Name:'
                  value={selectedformData?.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e)}
                  error={formErrors?.first_name || ''}
                />

                <InputField
                  type='text'
                  // isRequired
                  label='Middle Name:'
                  value={selectedformData?.middle_name || ''}
                  onChange={(e) => handleInputChange('middle_name', e)}
                  error={formErrors?.middle_name || ''}
                />

                <InputField
                  type='text'
                  isRequired
                  label='Last Name:'
                  value={selectedformData?.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e)}
                  error={formErrors?.last_name || ''}
                />
              </>
            ) : (
              <InputField
                type='text'
                isRequired
                label='Name:'
                value={selectedformData?.name || ''}
                onChange={(e) => handleInputChange('name', e)}
                error={formErrors?.name || ''}
              />
            )}

            <InputField
              type='text'
              isRequired
              label='Email:'
              value={selectedformData?.email || ''}
              onChange={(e) => handleInputChange('email', e)}
              error={formErrors?.email || ''}
            />

            <InputField
              type='tel'
              isRequired
              label='Mobile No:'
              value={selectedformData?.phone || ''}
              onChange={(e) => handleInputChange('phone', e)}
              error={formErrors?.phone || ''}
            />

            <SelectBox
              label='Role'
              isRequired
              options={
                isPBPartner
                  ? helperData?.partner_user_role
                  : helperData?.admin_user_role
              }
              selectedformData={selectedformData}
              value={selectedformData?.role_id}
              onChange={(e) => handleInputChange('role_id', Number(e))}
              error={formErrors?.role_id || ''}
            />

            <InputField
              type='text'
              isRequired
              label='Address 1:'
              value={selectedformData?.address_1 || ''}
              onChange={(e) => handleInputChange('address_1', e)}
              error={formErrors?.address_1 || ''}
            />

            <InputField
              type='text'
              isRequired
              label='Address 2:'
              value={selectedformData?.address_2 || ''}
              onChange={(e) => handleInputChange('address_2', e)}
              error={formErrors?.address_2 || ''}
            />

            {/* <CountrySelectBox
              isRequired
              label='Country'
              options={helperData?.country}
              value={selectedformData.country_id || null}
              onChange={(e) => handleCountryChage('country_id', Number(e))}
              error={formErrors?.country_id || ''}
            /> */}
            <StateSelectBox
              label='State'
              isRequired
              value={selectedformData?.state_id}
              onChange={(e) => handleStateChage('state_id', Number(e))}
              error={formErrors?.state_id || ''}
            />


            <SelectBox
              label='City'
              isRequired
              options={cityList}
              selectedformData={selectedformData}
              value={selectedformData?.city_id}
              onChange={(e) => handleInputChange('city_id', Number(e))}
              error={formErrors?.city_id || ''}
            />

            <InputField
              type='text'
              isRequired
              label='Locality:'
              value={selectedformData?.locality || ''}
              onChange={(e) => handleInputChange('locality', e)}
              error={formErrors?.locality || ''}
            />
            <InputField
              type='text'
              isRequired
              label='Zip:'
              value={selectedformData?.zip || ''}
              onChange={(e) => handleInputChange('zip', e)}
              error={formErrors?.zip || ''}
            />

            <div className='col-span-full flex flex-col gap-3'>
              <CheckboxItem
                checked={
                  selectedformData?.is_subscribed_sms === 2 ? true : false
                }
                onCheckedChange={(checked) =>
                  handleInputChange('is_subscribed_sms', checked ? 2 : 1)
                }
                ariaLabel='Subscribe to SMS'
                id='is_subscribed_sms'
              />
              <CheckboxItem
                checked={
                  selectedformData?.is_subscribed_email === 2 ? true : false
                }
                onCheckedChange={(checked) =>
                  handleInputChange('is_subscribed_email', checked ? 2 : 1)
                }
                ariaLabel='Subscribe to Email'
                id='is_subscribed_email'
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddAdmin;
