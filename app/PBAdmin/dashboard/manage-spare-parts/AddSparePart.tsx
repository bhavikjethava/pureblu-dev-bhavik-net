import React, { ChangeEvent, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import { IconLoading } from '@/utils/Icons';
import SelectBox from '@/components/SelectBox';
import { HelperData } from '@/utils/utils';

interface ManageSpareParttProps {
  open: boolean;
  onClose?: () => void;
  data?: any;
  onSave?: (newData: any) => void;
  onInputChange?: (key: string, value: string | number) => void;
  helperData: HelperData;
  formErrors?: { [key: string]: string };
  isLoading: boolean;
}

interface FormData {
  [key: string]: any;
}

const AddSparePart: React.FC<ManageSpareParttProps> = ({
  open,
  onClose,
  data,
  onSave,
  onInputChange,
  helperData,
  formErrors = {}, // Default value for errors,
  isLoading,
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
      title='Add / Edit Spare Parts'
      ClassName=''
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
            {/* Input fields with labels, values, change handlers, and error messages */}
            <InputField
              type='text'
              label='Particulars:'
              value={formData?.particulars || ''}
              onChange={(e) => handleInputChange('particulars', e)}
              error={formErrors?.particulars || ''}
            />
            <SelectBox
              label='Spare Type :'
              options={helperData.spare_type}
              value={formData.spare_type || ''}
              onChange={(e) => handleInputChange('spare_type', e)}
              error={formErrors?.spare_type || ''}
            />
            <SelectBox
              label='UOM :'
              options={helperData.uom}
              value={formData.uom || ''}
              onChange={(e) => handleInputChange('uom', e)}
              error={formErrors?.uom || ''}
            />
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddSparePart;
