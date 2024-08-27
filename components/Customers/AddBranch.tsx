import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import SelectBox from '@/components/SelectBox';
import MyDialog from '@/components/MyDialog';
import CountrySelectBox from '@/components/CountrySelectBox';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import ROUTES, { CITY, OptionType, STATE, getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { showToast } from '../Toast';
import { isRequired } from '@/utils/ValidationUtils';
import { Edit } from 'lucide-react';
import StateSelectBox from '../StateSelectBox';

interface AddBranchProps {
  open: boolean;
  selectedBranchData?: any;
  selectedCustomerID?: any;
  helperData?: any;
  onClose?: () => void;
  onSave?: (newData: any) => void;
  apiBaseUrl: any;
}

interface FormData {
  [key: string]: any;
}

const AddBranch: React.FC<AddBranchProps> = ({
  open,
  onClose,
  selectedBranchData,
  helperData,
  apiBaseUrl,
  selectedCustomerID,
  onSave,
}) => {
  const [selectedformData, setselectedFormData] = useState<FormData>({
    ...selectedBranchData,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormData>();
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const { stateList, cityList, setStateList, setCityList, fetchRequest } =
    useStateCity();

  useEffect(() => {
    if (selectedBranchData?.id) {
      // setStateList(selectedBranchData.allState);
      setCityList(selectedBranchData.allCity);
      // fetchRequest(STATE, selectedBranchData.country_id);
      fetchRequest(CITY, selectedBranchData.state_id);
    }
  }, []);

  const handleInputChange = (key: string, value: any) => {
    // Update the form data state in the parent component
    setselectedFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    if (isRequired(value)) {
      setErrors((prevError) => {
        return {
          ...prevError,
          [key]: '',
        };
      });
    }
  };

  const handleCountryChage = (key: string, value: number) => {
    setStateList([]);
    setCityList([]);
    setselectedFormData((prevData) => ({ ...prevData, state_id: -1 }));
    setselectedFormData((prevData) => ({ ...prevData, city_id: -1 }));
    fetchRequest(STATE, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
    if (isRequired(value)) {
      setErrors((pre) => {
        return {
          ...pre,
          [key]: '',
        };
      });
    }
  };

  const handleStateChage = (key: string, value: number) => {
    setCityList([]);
    setselectedFormData((prevData) => ({ ...prevData, city_id: -1 }));
    fetchRequest(CITY, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
    if (isRequired(value)) {
      setErrors((pre) => {
        return {
          ...pre,
          [key]: '',
        };
      });
    }
  };

  const handleSaveBranch = async () => {
    try {
      // Start the loading state
      setLoading(true);
      const isEdit = selectedformData?.id;
      const data = new FormData();
      Object.keys(selectedformData).map((key) => {
        if (
          key == 'id' ||
          key == 'old_id' ||
          key == 'created_at' ||
          key == 'updated_at' ||
          key == 'deleted_at' ||
          key == 'country' ||
          key == 'state' ||
          key == 'city' ||
          key == 'allCity' ||
          key == 'allState'
        )
          return;

        const value = selectedformData[key];

        data.append(key, value);
      });

      const valifationRules = [
        { field: 'name', value: selectedformData?.name, message: 'Name' },
        {
          field: 'email',
          value: selectedformData?.email,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        },
        {
          field: 'phone',
          value: selectedformData?.phone,
          message: 'Contact No',
          type: VALIDATIONTYPE.ISPHONE,
        },
        {
          field: 'address_1',
          value: selectedformData?.address_1,
          message: 'Address 1',
        },
        {
          field: 'contact_person',
          value: selectedformData?.contact_person,
          message: 'Contact Person',
        },
        {
          field: 'locality',
          value: selectedformData?.locality,
          message: 'Locality',
        },
        {
          field: 'state_id',
          value: selectedformData?.state_id,
          message: 'State',
        },
        { field: 'city_id', value: selectedformData?.city_id, message: 'City' },
        {
          field: 'zip',
          value: selectedformData?.zip,
          message: 'Zip',
          type: VALIDATIONTYPE.ISZIP,
        },
      ];

      let { isError, errors } = validateForm(valifationRules);

      if (isError) {
        setErrors(errors);
      } else {
        let apiUrl = `${apiBaseUrl.CUSTOMERS}/${selectedCustomerID}/branch`;

        const customer = {
          endpoint: apiUrl,
          method: 'POST',
          body: data,
          isFormData: true,
        };

        if (isEdit) {
          customer.endpoint = `${customer.endpoint}/${selectedformData.id}?_method=patch`;
        }

        const response = await apiAction.mutateAsync(customer);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setselectedFormData({});
          if (onSave) {
            if (isEdit) {
              onSave(response.data);
            } else {
              onSave(null);
            }
          }
          if (onClose) {
            onClose(); // Close the modal after saving if onClose is defined
          }
        }
      }
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      // Stop the loading state regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Branch'
      ClassName='h-full grow max-h-[71%]'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: handleSaveBranch,
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
              label='Branch Name'
              isRequired
              value={selectedformData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={errors?.name || ''}
            />
            <InputField
              type='text'
              label='Contact Person'
              value={selectedformData?.contact_person || ''}
              onChange={(e) => handleInputChange('contact_person', e)}
              error={errors?.contact_person || ''}
            />
            <InputField
              type='text'
              label='Email'
              isRequired
              value={selectedformData?.email || ''}
              onChange={(e) => handleInputChange('email', e)}
              error={errors?.email || ''}
            />
            <InputField
              type='tel'
              label='Contact No 1'
              isRequired
              value={selectedformData?.phone || ''}
              onChange={(e) => handleInputChange('phone', e)}
              error={errors?.phone || ''}
            />
            <InputField
              type='tel'
              label='Contact No 2'
              value={selectedformData?.phone_1 || ''}
              onChange={(e) => handleInputChange('phone_1', e)}
              error={errors?.phone_1 || ''}
            />
            <InputField
              type='text'
              label='Address 1'
              isRequired
              value={selectedformData?.address_1 || ''}
              onChange={(e) => handleInputChange('address_1', e)}
              error={errors?.address_1 || ''}
            />
            <InputField
              type='text'
              label='Address 2'
              value={selectedformData?.address_2 || ''}
              onChange={(e) => handleInputChange('address_2', e)}
              error={errors?.address_2 || ''}
            />
            <InputField
              type='text'
              label='Address 3'
              value={selectedformData?.address_3 || ''}
              onChange={(e) => handleInputChange('address_3', e)}
              error={errors?.address_3 || ''}
            />
            <InputField
              type='text'
              label='Locality'
              isRequired
              value={selectedformData?.locality || ''}
              onChange={(e) => handleInputChange('locality', e)}
              error={errors?.locality || ''}
            />{' '}
            <StateSelectBox
              label='State'
              value={selectedformData.state_id || ''}
              onChange={(e) => handleStateChage('state_id', Number(e))}
              error={errors?.state_id || ''}
            />
            <SelectBox
              isRequired
              label='City'
              options={cityList}
              value={selectedformData?.city_id || ''}
              onChange={(e) => handleInputChange('city_id', Number(e))}
              error={errors?.city_id || ''}
            />
            <InputField
              type='text'
              isRequired
              label='Zip'
              value={selectedformData?.zip || ''}
              onChange={(e) => handleInputChange('zip', e)}
              error={errors?.zip || ''}
            />{' '}
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddBranch;
