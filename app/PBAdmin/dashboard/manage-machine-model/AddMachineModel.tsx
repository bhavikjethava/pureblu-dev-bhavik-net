import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import { IconLoading } from '@/utils/Icons';
import SelectBox from '@/components/SelectBox';

interface ManageMachineModelProps {
  open: boolean;
  onClose?: () => void;
  data?: any;
  onSave?: (newData: any) => void;
  onInputChange?: (key: string, value: string | number) => void;
  formErrors?: { [key: string]: string };
  isLoading: boolean;
  formHelper: { [key: string]: any };
}

interface FormData {
  [key: string]: any;
}

const AddMachineModel: React.FC<ManageMachineModelProps> = ({
  open,
  onClose,
  data,
  onSave,
  onInputChange,
  formErrors = {}, // Default value for errors,
  isLoading,
  formHelper,
}) => {
  // React State: Form data state and function to update it
  const [formData, setFormData] = useState<FormData>({
    ...data,
  });

  // React Effect: Update form data when the data prop changes (e.g., when editing)
  useEffect(() => {
    if (open && data) {
      // If the dialog is open and there is data, pre-fill the form
      setFormData((prevData) => ({ ...prevData, ...data }));
    }
    // setFormErrors({});
  }, [open, data]);

  const handleSave = async () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handleInputChange = (key: string, value: string | number) => {
    onInputChange?.(key, value);
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  // React Component: Render the UI
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Machine Model'
      ClassName='h-[88%]'
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
        <div className='flex grow flex-col overflow-auto p-4'>
          <div className='grid  gap-5'>
            <SelectBox
              label='Brands:'
              options={formHelper.brandList}
              value={formData.brand_id || ''}
              onChange={(e) => handleInputChange('brand_id', e)}
              error={formErrors?.brand_id || ''}
            />
            <SelectBox
              label='Machine Type:'
              options={formHelper.machineTypeList}
              value={formData.machine_type_id || ''}
              onChange={(e) => handleInputChange('machine_type_id', e)}
              error={formErrors?.machine_type_id || ''}
            />
            <SelectBox
              label='Varient:'
              options={formHelper.variantList}
              value={formData.machine_variant_id || ''}
              onChange={(e) => handleInputChange('machine_variant_id', e)}
              error={formErrors?.machine_variant_id || ''}
            />
            <InputField
              type='text'
              label='Model Number:'
              value={formData?.model_number || ''}
              onChange={(e) => handleInputChange('model_number', e)}
              error={formErrors?.model_number || ''}
            />
            <InputField
              type='text'
              label='Capacity:'
              value={formData?.capacity || ''}
              onChange={(e) => handleInputChange('capacity', e)}
              error={formErrors?.capacity || ''}
            />
            <SelectBox
              label='Capacity Unit:'
              options={formHelper.capcityUnitList}
              value={formData.capacity_unit || ''}
              onChange={(e) => handleInputChange('capacity_unit', e)}
              error={formErrors?.capacity_unit || ''}
            />
            <SelectBox
              label='Rating:'
              options={formHelper.rating}
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', e)}
              error={formErrors?.rating || ''}
            />
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddMachineModel;
