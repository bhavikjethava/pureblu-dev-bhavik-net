import React, { useContext, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import SelectBox from '@/components/SelectBox';
import MyDialog from '@/components/MyDialog';
import CountrySelectBox from '@/components/CountrySelectBox';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { IconLoading } from '@/utils/Icons';
import ROUTES, {
  CITY,
  DEFAULT_COUNTRY,
  HELPERSDATA,
  OptionType,
  STATE,
  getBaseUrl,
} from '@/utils/utils';
import { usePathname } from 'next/navigation';
import StateSelectBox from '../StateSelectBox';

interface AddCustomerProps {
  open: boolean;
  selectedData?: any;
  helperData?: any;
  onInputChange?: (key: string, value: any) => void;
  onClose?: () => void;
  onSave?: (newData: any) => void;
  formErrors?: { [key: string]: string };
  loading?: boolean;
}

interface FormData {
  [key: string]: any;
}

const statusList = [
  { id: 0, name: 'Select' },
  { id: 1, name: 'Active' },
  { id: 2, name: 'Inactive' },
  { id: 3, name: 'Disabled' },
];

const AddCustomer: React.FC<AddCustomerProps> = ({
  open,
  onClose,
  selectedData,
  helperData,
  onInputChange,
  onSave,
  loading,
  formErrors = {}, // Default value for errors
}) => {
  const [selectedformData, setselectedFormData] = useState<FormData>({
    ...selectedData,
  });

  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;
  const { stateList, cityList, setStateList, setCityList, fetchRequest } =
    useStateCity();

  useEffect(() => {
    if (selectedData.id) {
      // setStateList(selectedData.allState);
      setCityList(selectedData.allCity);
      // fetchState(STATE);
      fetchRequest(CITY, selectedData.state_id);
    }
  }, []);

  const handleInputChange = (key: string, value: any) => {
    onInputChange?.(key, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleCountryChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    onInputChange?.('state_id', -1);
    onInputChange?.('city_id', -1);
    setStateList([]);
    setCityList([]);
    fetchRequest(STATE, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleStateChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    onInputChange?.('city_id', -1);
    setCityList([]);
    fetchRequest(CITY, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(selectedformData);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Customers'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
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
          <div className='grid grid-cols-2 gap-5'>
            <InputField
              type='text'
              label='Customer Name'
              isRequired
              value={selectedformData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={formErrors?.name || ''}
            />
            <InputField
              type='text'
              label='Email'
              value={selectedformData?.email || ''}
              onChange={(e) => handleInputChange('email', e)}
              error={formErrors?.email || ''}
            />
            <InputField
              type='text'
              label='Email 1'
              value={selectedformData?.email_1 || ''}
              onChange={(e) => handleInputChange('email_1', e)}
              error={formErrors?.email_1 || ''}
            />
            <InputField
              type='text'
              label='Email 2'
              value={selectedformData?.email_2 || ''}
              onChange={(e) => handleInputChange('email_2', e)}
              error={formErrors?.email_2 || ''}
            />
            <InputField
              type='tel'
              label='Contact No 1'
              isRequired
              value={selectedformData?.phone || ''}
              onChange={(e) => handleInputChange('phone', e)}
              error={formErrors?.phone || ''}
            />
            <InputField
              type='tel'
              label='Contact No 2'
              value={selectedformData?.phone_1 || ''}
              onChange={(e) => handleInputChange('phone_1', e)}
              error={formErrors?.phone_1 || ''}
            />
            <InputField
              type='text'
              label='Address 1'
              isRequired
              value={selectedformData?.address_1 || ''}
              onChange={(e) => handleInputChange('address_1', e)}
              error={formErrors?.address_1 || ''}
            />
            <InputField
              type='text'
              label='Address 2'
              value={selectedformData?.address_2 || ''}
              onChange={(e) => handleInputChange('address_2', e)}
              error={formErrors?.address_2 || ''}
            />
            <InputField
              type='text'
              label='Address 3'
              value={selectedformData?.address_3 || ''}
              onChange={(e) => handleInputChange('address_3', e)}
              error={formErrors?.address_3 || ''}
            />
            <InputField
              type='text'
              label='Locality'
              isRequired
              value={selectedformData?.locality || ''}
              onChange={(e) => handleInputChange('locality', e)}
              error={formErrors?.locality || ''}
            />{' '}
            <StateSelectBox
              isRequired
              label='State'
              value={selectedformData.state_id || ''}
              onChange={(e) => handleStateChage('state_id', Number(e))}
              error={formErrors?.state_id || ''}
            />
            <SelectBox
              isRequired
              label='City'
              options={cityList}
              value={selectedformData?.city_id || ''}
              onChange={(e) => handleInputChange('city_id', Number(e))}
              error={formErrors?.city_id || ''}
            />
            <InputField
              type='text'
              isRequired
              label='Zip'
              value={selectedformData?.zip || ''}
              onChange={(e) => handleInputChange('zip', e)}
              error={formErrors?.zip || ''}
            />{' '}
            <InputField
              type='text'
              label='GST'
              value={selectedformData?.gst || ''}
              onChange={(e) => handleInputChange('gst', e)}
              error={formErrors?.gst || ''}
              className={'w-full'}
            />
            <InputField
              type='text'
              label='PAN'
              value={selectedformData?.pan || ''}
              onChange={(e) => handleInputChange('pan', e)}
              error={formErrors?.pan || ''}
              className={'w-full'}
            />
            <InputField
              type='text'
              label='TAN'
              value={selectedformData?.tan || ''}
              onChange={(e) => handleInputChange('tan', e)}
              error={formErrors?.tan || ''}
              className={'w-full'}
            />
            {isPBEnterprise ? (
              <>
                <InputField
                  type='tel'
                  label='Active Building Device ID:'
                  value={selectedformData?.device_id || ''}
                  onChange={(e) => handleInputChange('device_id', +e)}
                  error={formErrors?.device_id || ''}
                  className={'w-full'}
                />
                <InputField
                  type='tel'
                  label='Active Building Node ID:'
                  value={selectedformData?.node_id || ''}
                  onChange={(e) => handleInputChange('node_id', +e)}
                  error={formErrors?.node_id || ''}
                  className={'w-full'}
                />
                <InputField
                  type='tel'
                  label='Airgradient Location ID:'
                  value={selectedformData?.location_id || ''}
                  onChange={(e) => handleInputChange('location_id', +e)}
                  error={formErrors?.location_id || ''}
                  className={'w-full'}
                />
              </>
            ) : null}
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddCustomer;
