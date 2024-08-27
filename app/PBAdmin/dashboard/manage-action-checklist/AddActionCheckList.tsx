import React, { ChangeEvent, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import { IconLoading } from '@/utils/Icons';

interface ManageActionCheckListProps {
  open: boolean;
  onClose?: () => void;
  data?: any;
  onSave?: (newData: any) => void;
  onInputChange?: (key: string, value: string) => void;
  formErrors?: { [key: string]: string };
  isLoading: boolean;
}

interface FormData {
  [key: string]: any;
}

const AddActionCheckList: React.FC<ManageActionCheckListProps> = ({
  open,
  onClose,
  data,
  onSave,
  onInputChange,
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

  const handleInputChange = (key: string, value: string) => {
    onInputChange?.(key, value);
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  // React Component: Render the UI
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Action Check List'
      ClassName='sm:max-w-[50%]'
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
              label='Title:'
              value={formData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={formErrors?.name || ''}
            />
            <InputField
              type='text'
              label='Description:'
              value={formData?.description || ''}
              onChange={(e) => handleInputChange('description', e)}
              error={formErrors?.description || ''}
            />
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddActionCheckList;
