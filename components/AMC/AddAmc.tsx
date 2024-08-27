import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import { IconLoading } from '@/utils/Icons';
import SelectBox from '@/components/SelectBox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckboxItem from '@/components/CheckboxItem';

interface ManageAMCProps {
  open: boolean;
  onClose?: () => void;
  data?: any;
  onSave?: (newData: any) => void;
  onInputChange?: (key: string, value: string | number) => void;
  formErrors?: { [key: string]: string };
  isLoading: boolean;
  helperData?: any;
}

interface FormData {
  [key: string]: any;
}

const AddAMC: React.FC<ManageAMCProps> = ({
  open,
  onClose,
  data,
  onSave,
  onInputChange,
  formErrors = {}, // Default value for errors,
  isLoading,
  helperData,
}) => {
  // React State: Form data state and function to update it
  const [formData, setFormData] = useState<FormData>({
    no_of_days: 365,
    machine_age: 1,
    condensor_cooling_coil: 2,
    compressor_type: 'Rotary',
    ...data,
  });
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [serviceSelectBoxes, setServiceSelectBoxes] = useState<string[]>([]);
  const [isSelectedAll, setSelectAll] = useState(false);

  const cndensorList = [
    { id: -1, name: 'Select' },
    { id: 1, name: 'Aluminium' },
    { id: 2, name: 'Copper' },
  ];
  const serviceList = [
    { id: 1, name: 'Preventive Service' },
    { id: 2, name: 'Dismantle service' },
    { id: 3, name: 'Pressure pump service' },
    { id: 4, name: 'Wet service' },
  ];
  // React Effect: Update form data when the data prop changes (e.g., when editing)
  useEffect(() => {
    if (open && data) {
      // If the dialog is open and there is data, pre-fill the form
      setFormData((prevData) => ({ ...prevData, ...data }));
    }
    // setFormErrors({});
  }, [open, data]);

  // set selected brands
  useEffect(() => {
    if (data?.brands?.length > 0) {
      const _selectedBrandIds = data?.brands?.map((x: any) => x?.brand_id);
      setSelectedBrandIds(_selectedBrandIds);
    }
  }, []);

  useEffect(() => {
    setSelectAll(selectedBrandIds.length === helperData?.brand?.length);
  }, [selectedBrandIds]);

  const handleSave = async () => {
    if (onSave) {
      const formDataWithIds = {
        ...formData,
        ...(selectedBrandIds.length > 0 && { brand_ids: selectedBrandIds }),
      };
      await onSave(formDataWithIds);
    }
  };

  const generateServiceSelectBoxes = () => {
    const selectBoxes = [];
    for (let i = 1; i <= formData.services_in_year; i++) {
      const key = i;
      const selectedValue = formData.service_name?.[key] || '';
      selectBoxes.push(
        <SelectBox
          key={key}
          isRequired
          label={`Service ${i}`}
          options={serviceList}
          value={selectedValue}
          onChange={(e) => handleInputChange(`service_${key}`, e)} // onChange handler is still `service_${i}`
          error={formErrors[`service_${key}`] || ''}
        />
      );
    }
    return selectBoxes;
  };

  const handleInputChange = (key: string, value: string | number) => {
    onInputChange?.(key, value);

    if (key === 'services_in_year') {
      const count = Number(value);
      // Create a new service_name object outside setFormData
      const newServiceName: { [key: number]: string } = {};
      for (let i = 1; i <= count; i++) {
        newServiceName[i] =
          formData.service_name && formData.service_name[i]
            ? formData.service_name[i]
            : 1;
      }
      setFormData((prevData) => ({
        ...prevData,
        [key]: count,
        service_name: newServiceName,
      }));
    } else if (key.startsWith('service_')) {
      // Extract the service number and update the service_name object
      const serviceNumber = key.split('_')[1];
      setFormData((prevData) => ({
        ...prevData,
        service_name: {
          ...prevData.service_name,
          [serviceNumber]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [key]: value }));
    }

    // setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleBrandChange = (id: number, checked: boolean) => {
    // If the checkbox is checked, add the id to the selectedBrandIds array
    // If unchecked, remove the id from the selectedBrandIds array
    setSelectedBrandIds((prevIds) => {
      if (checked) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });
  };

  const onAllBrandSelect = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedBrandIds(helperData?.brand?.map((x: any) => x?.id));
    } else {
      setSelectedBrandIds([]);
    }
  };

  // React Component: Render the UI
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit AMC'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: handleSave,
          icon: isLoading ? <IconLoading /> : '',
        },
      ]}
    >
      <ScrollArea className='grow '>
        <div className='flex grow flex-col gap-5 overflow-auto p-4'>
          <div className='grid grid-cols-2  gap-5'>
            <InputField
              isRequired
              type='text'
              label='Code:'
              value={formData?.amc_code || ''}
              onChange={(e) => handleInputChange('amc_code', e)}
              error={formErrors?.amc_code || ''}
            />
            <InputField
              isRequired
              type='text'
              label='Description of AMC plan:'
              value={formData?.amc_description || ''}
              onChange={(e) => handleInputChange('amc_description', e)}
              error={formErrors?.amc_description || ''}
            />
            <InputField
              isRequired
              type='text'
              label='Machine Age'
              value={formData?.machine_age || ''}
              onChange={(e) => handleInputChange('machine_age', e.toString())}
              error={formErrors?.machine_age || ''}
            />
            <InputField
              isRequired
              type='text'
              label='Compressor Type ( Rotary / Scroll / Invertor )'
              value={formData?.compressor_type || ''}
              onChange={(e) => handleInputChange('compressor_type', e)}
              error={formErrors?.compressor_type || ''}
            />

            <InputField
              isRequired
              type='text'
              label='No of Days'
              value={formData?.no_of_days || ''}
              onChange={(e) => handleInputChange('no_of_days', e)}
              error={formErrors?.no_of_days || ''}
            />

            <InputField
              isRequired
              type='text'
              label='Services in a year'
              value={formData?.services_in_year || ''}
              onChange={(e) => handleInputChange('services_in_year', e)}
              error={formErrors?.services_in_year || ''}
            />

            <SelectBox
              isRequired
              label='Condensor Coil / Cooling Coil'
              options={cndensorList}
              value={formData?.condensor_cooling_coil || ''}
              onChange={(e) =>
                handleInputChange('condensor_cooling_coil', e.toString())
              }
              error={formErrors?.condensor_cooling_coil || ''}
            />

            {/* {formData.services_in_year > 0 && generateServiceSelectBoxes()} */}
          </div>
          <div className='w-full'>
            <Card className='h-full overflow-hidden'>
              <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                <CardTitle className='text-lg font-normal'>Brands</CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='pb-4'>
                  <CheckboxItem
                    key={'select_All'}
                    checked={isSelectedAll}
                    onCheckedChange={onAllBrandSelect}
                    ariaLabel='Select All'
                    id='select_All'
                  />
                </div>
                <div className='grid grid-cols-4 gap-4'>
                  {helperData &&
                    helperData?.brand?.map((item: any) => (
                      <>
                        <CheckboxItem
                          key={item.id}
                          checked={selectedBrandIds.includes(item.id)} // Check if the current brand id is in the selectedBrandIds array
                          onCheckedChange={(checked) =>
                            handleBrandChange(item.id, checked)
                          }
                          ariaLabel={item?.name}
                          id={`brand_${item.id}`}
                        />
                      </>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddAMC;
