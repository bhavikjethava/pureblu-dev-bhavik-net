import React, { useContext, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Editor from '@/components/Editor';
import CheckboxItem from '@/components/CheckboxItem';
import SelectBox from '@/components/SelectBox';
import CountrySelectBox from '@/components/CountrySelectBox';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { apiCall, useApiResource, useStateCity } from '@/hooks/api';
import { useMutation } from 'react-query';
import {
  ACTIVETECHNICITION,
  AUTH,
  CITY,
  HELPERSDATA,
  STATE,
} from '@/utils/utils';
import Image from 'next/image';
import { IconLoading } from '@/utils/Icons';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import {
  ERROR_MESSAGES,
  isRequired,
  isValidPhoneNumber,
} from '@/utils/ValidationUtils';
import dynamic from 'next/dynamic';
import { DataContext } from '@/context/dataProvider';

const CustomEditor = dynamic(
  () => {
    return import('../../components/CKEditor/Editor');
  }
  // { ssr: false }
);

interface AddPartnersProps {
  open: boolean;
  onClose?: () => void;
  data?: any;
  onSave?: (newData: any) => void;
  onInputChange?: (key: string, value: string | File | number) => void;
  formErrors?: { [key: string]: any };
  helperData?: { [key: string]: any };
  isPBPartner?: boolean;
}

interface FormData {
  [key: string]: any;
}

interface optionType {
  id: number;
  name: string;
}

const AddPartner: React.FC<AddPartnersProps> = ({
  open,
  onClose,
  data,
  onSave,
  onInputChange,
  formErrors = {}, // Default value for errors
  helperData,
  isPBPartner,
}) => {
  // React State: Form data state and function to update it
  const formatedFormData = {
    ...data,
    'user[first_name]': data?.user?.first_name,
    'user[middle_name]': data?.user?.middle_name,
    'user[last_name]': data?.user?.last_name,
    'user[email]': data?.user?.email,
    'user[phone]': data?.user?.phone,
    'user[address_1]': data?.user?.address_1,
    'user[address_2]': data?.user?.address_2,
    'user[locality]': data?.user?.locality,
    'user[country_id]': data?.user?.country_id,
    'user[state_id]': data?.user?.state_id,
    'user[city_id]': data?.user?.city_id,
    'user[zip]': data?.user?.zip,
    'user[is_subscribed_sms]': data?.user?.is_subscribed_sms || 2,
    'user[is_subscribed_email]': data?.user?.is_subscribed_email || 2,
  };
  const [formData, setFormData] = useState<FormData>({
    ...formatedFormData,
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [saveLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  const { stateList, cityList, setStateList, setCityList, fetchRequest } =
    useStateCity();
  const { state } = useContext(DataContext);

  useEffect(() => {
    if (data?.id != undefined) {
      if (data?.user?.city) setCityList([data.user.city]);
      if (data?.user?.country_id) {
        fetchRequest(STATE, data?.user?.country_id);
      }
      if (data?.user?.state_id) {
        setStateList([data.user.state]);
        fetchRequest(CITY, data?.user.state_id);
      }
    }
  }, [data]);

  // React Effect: Update form data when the data prop changes (e.g., when editing)
  useEffect(() => {
    if (open && data) {
      // If the dialog is open and there is data, pre-fill the form
      setFormData((prevData) => ({ ...prevData, ...data }));
    }
    // setFormErrors({});
  }, [open, data]);

  const handleSave = async () => {
    try {
      const {
        name,
        type,
        letterhead,
        logo,
        active_technicians,
        customer_reply_to,
        'user[first_name]': first_name,
        'user[middle_name]': middle_name,
        'user[last_name]': last_name,
        'user[email]': email,
        'user[phone]': phone,
        'user[address_1]': address_1,
        'user[address_2]': address_2,
        'user[locality]': locality,
        'user[country_id]': country_id,
        'user[state_id]': state_id,
        'user[city_id]': city_id,
        'user[zip]': zip,
        public_number,
      } = formData;

      // Create user object for certain fields if it exists
      const valifationRules: any = [
        { field: 'name', value: name, message: 'Partner Name' },
        { field: 'user.first_name', value: first_name, message: 'First Name' },
        // {
        //   field: 'user.middle_name',
        //   value: middle_name,
        //   message: 'Middle Name',
        // },
        { field: 'user.last_name', value: last_name, message: 'Last Name' },
        {
          field: 'user.email',
          value: email,
          message: 'Email',
          type: VALIDATIONTYPE.ISEMAIL,
        },
        {
          field: 'user.phone',
          value: phone,
          message: 'Mobile No.',
          type: VALIDATIONTYPE.ISPHONE,
          phoneLength: country_id == 200 ? 9 : 10,
        },
        { field: 'user.address_1', value: address_1, message: 'Address 1' },
        { field: 'user.address_2', value: address_2, message: 'Address 2' },
        { field: 'user.locality', value: locality, message: 'Locality' },
        { field: 'user.country_id', value: country_id, message: 'Country' },
        { field: 'user.state_id', value: state_id, message: 'State' },
        { field: 'user.city_id', value: city_id, message: 'City' },
        {
          field: 'user.zip',
          value: zip,
          message: 'Zip',
          type: VALIDATIONTYPE.ISZIP,
        },
        { field: 'type', value: type, message: 'Partner Type' },
        { field: 'letterhead', value: letterhead, message: 'Letterhead' },
        {
          field: 'logo',
          value: logo,
          message: 'Logo',
          type: VALIDATIONTYPE.ISFILE,
        },
        {
          field: 'active_technicians',
          value: active_technicians,
          message: 'Active Technicians',
        },
      ];

      if (isRequired(customer_reply_to)) {
        valifationRules.push({
          field: 'customer_reply_to',
          value: customer_reply_to,
          customMessage: 'Please enter valid Email',
          type: VALIDATIONTYPE.ISEMAIL,
        });
      }

      let { isError, errors } = validateForm(valifationRules);

      if (!logo) {
        isError = true;
        errors['logo'] = `Logo ${ERROR_MESSAGES.required}`;
      }
      if (isRequired(public_number)) {
        if (!isValidPhoneNumber(public_number)) {
          isError = true;
          errors['public_number'] = `Public number ${ERROR_MESSAGES.invalid}`;
        }
      }

      if (isError) {
        onSave?.({ isError, errors });
      } else {
        setLoading(true);
        const isEdit = formData?.id;
        const data = new FormData();

        Object.keys(formData).map((key) => {
          if (
            key == 'id' ||
            key == 'old_id' ||
            key == 'data_download' ||
            key == 'is_active' ||
            key == 'final_limit' ||
            key == 'created_at' ||
            key == 'updated_at' ||
            key == 'deleted_at' ||
            key == 'country' ||
            key == 'state' ||
            key == 'city' ||
            key == 'user' ||
            (key == 'user[middle_name]' && !formData[key]) ||
            (isEdit && key == 'logo' && !(formData?.logo instanceof File)) ||
            (isEdit && key == 'public_number' && formData[key] == null)
          )
            return;
          data.append(key, formData[key] == null ? '' : formData[key]);
        });

        const partner = {
          endpoint: isPBPartner
            ? API_ENDPOINTS_PARTNER.UPDATE_PARTNER
            : API_ENDPOINTS.PARTNER,
          method: 'POST',
          body: data,
          isFormData: true,
        };
        if (isEdit && !isPBPartner)
          partner.endpoint = `${partner.endpoint}/${formData.id}?_method=patch`;
        const partnersResponse = await apiAction.mutateAsync(partner);
        setLoading(false);
        if (partnersResponse?.isError) {
          onSave?.({ isError: true, errors: partnersResponse.errors });
        } else {
          onSave?.({ response: partnersResponse });
        }
      }
    } catch (e: any) {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    onInputChange?.(key, value);

    // Update the formData directly for non-nested keys
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleFileInputChange = (key: string, e: any) => {
    if (e?.target?.files && e?.target?.files[0]) {
      let file = e.target.files[0];
      setFormData((prevData) => ({ ...prevData, [key]: file }));
      onInputChange?.('logo', file);
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleCountryChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    setStateList([]);
    setCityList([]);
    fetchRequest(STATE, value);
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
      'user[state_id]': -1,
      'user[city_id]': -1,
    }));
  };

  const handleStateChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    setCityList([]);
    fetchRequest(CITY, value);
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
      'user[city_id]': -1,
    }));
  };

  const handleEditorChange = (value: any) => {
    handleInputChange('letterhead', value);
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    // Update the formData directly for non-nested keys
    setFormData((prevData) => ({
      ...prevData,
      [id]: checked,
    }));
    // Update corresponding property in formData
    handleInputChange(id, checked ? '1' : '2');
  };
  // React Component: Render the UI
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title={isPBPartner ? `Edit Profile` : `Add / Edit Partners`}
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
      onInteractOutside={(e: any) => {
        e.preventDefault();
      }}
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: handleSave,
          icon: saveLoading ? <IconLoading /> : '',
        },
      ]}
    >
      <ScrollArea className='grow '>
        <div className='flex grow flex-col overflow-auto p-4'>
          <div className='grid grid-cols-2 gap-5'>
            {/* Input fields with labels, values, change handlers, and error messages */}
            <InputField
              type='text'
              isRequired
              label='Partner Name'
              value={formData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={formErrors?.name || ''}
            />
            <InputField
              type='text'
              label='First Name'
              isRequired
              value={formData?.['user[first_name]'] || ''}
              onChange={(e) => handleInputChange('user[first_name]', e)}
              error={formErrors?.['user.first_name'] || ''}
            />
            <InputField
              type='text'
              label='Middle Name'
              // isRequired
              value={formData?.['user[middle_name]'] || ''}
              onChange={(e) => handleInputChange('user[middle_name]', e)}
              error={formErrors?.['user.middle_name'] || ''}
            />
            <InputField
              type='text'
              label='Last Name'
              isRequired
              value={formData?.['user[last_name]'] || ''}
              onChange={(e) => handleInputChange('user[last_name]', e)}
              error={formErrors?.['user.last_name'] || ''}
            />
            <InputField
              type='text'
              label='Email'
              isRequired
              value={formData?.['user[email]'] || ''}
              onChange={(e) => handleInputChange('user[email]', e)}
              error={formErrors?.['user.email'] || ''}
            />
            <InputField
              type='text'
              isRequired
              label='Mobile No'
              value={formData?.['user[phone]'] || ''}
              onChange={(e) => handleInputChange('user[phone]', e)}
              error={formErrors?.['user.phone'] || ''}
            />
            <InputField
              type='text'
              label='Address 1'
              isRequired
              value={formData?.['user[address_1]'] || ''}
              onChange={(e) => handleInputChange('user[address_1]', e)}
              error={formErrors?.['user.address_1'] || ''}
            />
            <InputField
              type='text'
              isRequired
              label='Address 2'
              value={formData?.['user[address_2]'] || ''}
              onChange={(e) => handleInputChange('user[address_2]', e)}
              error={formErrors?.['user.address_2'] || ''}
            />
            <InputField
              type='text'
              label='Locality'
              isRequired
              value={formData?.['user[locality]'] || ''}
              onChange={(e) => handleInputChange('user[locality]', e)}
              error={formErrors?.['user.locality'] || ''}
            />
            <div className='col-span-full flex w-full flex-col gap-5 lg:flex-row'>
              <div className={'w-full'}>
                <CountrySelectBox
                  isRequired
                  label='Country'
                  options={helperData?.country}
                  value={formData?.['user[country_id]'] || null}
                  onChange={(e) => handleCountryChage('user[country_id]', e)}
                  error={formErrors?.['user.country_id'] || ''}
                />
              </div>
              <div className={'w-full'}>
                <SelectBox
                  isRequired
                  label='State'
                  options={stateList}
                  value={formData?.['user[state_id]'] || ''}
                  onChange={(e) => handleStateChage('user[state_id]', e)}
                  error={formErrors?.['user.state_id'] || ''}
                />
              </div>
              <div className={'w-full'}>
                <SelectBox
                  isRequired
                  label='City'
                  options={cityList}
                  value={formData?.['user[city_id]'] || ''}
                  onChange={(e) => handleInputChange('user[city_id]', e)}
                  error={formErrors?.['user.city_id'] || ''}
                />
              </div>
            </div>
            <div className='col-span-full grid grid-cols-1 gap-5 lg:grid-cols-2'>
              <div className='flex flex-col gap-5'>
                <InputField
                  type='text'
                  isRequired
                  label='Zip'
                  value={formData?.['user[zip]'] || ''}
                  onChange={(e) => handleInputChange('user[zip]', e)}
                  error={formErrors?.['user.zip'] || ''}
                  className={'w-full'}
                />
                <InputField
                  type='text'
                  label='Customer Reply To'
                  value={formData?.customer_reply_to || ''}
                  onChange={(e) => handleInputChange('customer_reply_to', e)}
                  error={formErrors?.customer_reply_to || ''}
                  className={'w-full'}
                />
                <InputField
                  type='text'
                  label='GST'
                  value={formData?.gst || ''}
                  onChange={(e) => handleInputChange('gst', e)}
                  error={formErrors?.gst || ''}
                  className={'w-full'}
                />
                <InputField
                  type='text'
                  label='PAN'
                  value={formData?.pan || ''}
                  onChange={(e) => handleInputChange('pan', e)}
                  error={formErrors?.pan || ''}
                  className={'w-full'}
                />
                <InputField
                  type='text'
                  label='TAN'
                  value={formData?.tan || ''}
                  onChange={(e) => handleInputChange('tan', e)}
                  error={formErrors?.tan || ''}
                  className={'w-full'}
                />
                <Card className='overflow-hidden'>
                  <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                    <CardTitle className='text-lg font-normal'>
                      Partner Logo*
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-4'>
                    <InputField
                      type='file'
                      label=''
                      accept='image/*'
                      onChange={(e) => handleFileInputChange('logo', e)}
                      error={formErrors?.logo || ''}
                      className={'w-full'}
                    />
                    {logo ? (
                      <Image src={logo} alt={'logo'} height={60} width={60} />
                    ) : formData?.logo ? (
                      <Image
                        src={formData?.logo}
                        alt={'logo'}
                        height={60}
                        width={60}
                      />
                    ) : null}
                  </CardContent>
                </Card>

                <CheckboxItem
                  checked={formData.is_working_sunday == 1}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('is_working_sunday', checked)
                  }
                  ariaLabel='Sunday Working'
                  id='is_working_sunday'
                />

                <CheckboxItem
                  checked={formData.is_signature_required == 1}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('is_signature_required', checked)
                  }
                  ariaLabel='Required signature'
                  id='is_signature_required'
                />
              </div>
              <div className='flex flex-col gap-5'>
                <div className='flex gap-5'>
                  <div className='flex w-full flex-col gap-5'>
                    <div className='w-full'>
                      <SelectBox
                        isRequired
                        disabled={isPBPartner}
                        label='Partner Type'
                        options={state?.[HELPERSDATA]?.partner_type}
                        value={formData?.type || ''}
                        onChange={(e) => handleInputChange('type', e)}
                        error={formErrors?.type || ''}
                      />
                    </div>
                    <CheckboxItem
                      checked={formData?.['user[is_subscribed_sms]'] == 1}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('user[is_subscribed_sms]', checked)
                      }
                      ariaLabel='Subscribe to SMS'
                      id='is_subscribed_sms'
                    />
                    {!isPBPartner && (
                      <>
                        <CheckboxItem
                          checked={formData.is_subscribed_whatsapp == 1}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              'is_subscribed_whatsapp',
                              checked
                            )
                          }
                          ariaLabel='Subscribe to WhatsApp'
                          id='is_subscribed_whatsapp'
                        />
                        <CheckboxItem
                          checked={formData.is_hide_technician_number == 1}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              'is_hide_technician_number',
                              checked
                            )
                          }
                          ariaLabel='Hide Technician Number'
                          id='is_hide_technician_number'
                        />{' '}
                      </>
                    )}
                  </div>
                  <div className='flex w-full flex-col gap-5'>
                    <div className=''>
                      {!isPBPartner ? (
                        <SelectBox
                          label='Active Technician'
                          options={ACTIVETECHNICITION()}
                          value={formData?.active_technicians}
                          onChange={(e) =>
                            handleInputChange('active_technicians', e)
                          }
                          error={formErrors?.active_technicians || ''}
                          isRequired
                        />
                      ) : null}
                    </div>

                    <CheckboxItem
                      checked={formData?.['user[is_subscribed_email]'] == 1}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          'user[is_subscribed_email]',
                          checked
                        )
                      }
                      ariaLabel='Subscribe to Email'
                      id='is_subscribed_email'
                    />
                    <InputField
                      type='text'
                      label='Public Number'
                      value={formData?.public_number || ''}
                      onChange={(e) => handleInputChange('public_number', e)}
                      error={formErrors?.public_number || ''}
                      className={'w-full'}
                    />
                  </div>
                </div>
                <div>
                  <CustomEditor
                    initialData={formData?.letterhead}
                    onChange={handleEditorChange}
                  />
                </div>
                {/* <Editor
                  value={formData?.letterhead || ''}
                  onChange={handleEditorChange}
                  title='Letterhead*'
                /> */}
                {formErrors.letterhead && (
                  <div className='mt-1 text-xs text-pbHeaderRed'>
                    {formErrors.letterhead}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddPartner;
