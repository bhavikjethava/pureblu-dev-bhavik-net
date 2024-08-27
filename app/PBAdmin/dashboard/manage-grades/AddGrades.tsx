import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import { IconLoading } from '@/utils/Icons';
import SelectBox from '@/components/SelectBox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckboxItem from '@/components/CheckboxItem';

interface ManageGradesProps {
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

const AddGrades: React.FC<ManageGradesProps> = ({
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
    ...data,
  });
  const [selectedSkillids, setSelectedSkillids] = useState<number[]>([]);
  const [selectedMachineVariantids, setSelectedMachineVariantids] = useState<
    number[]
  >([]);

  // React Effect: Update form data when the data prop changes (e.g., when editing)
  useEffect(() => {
    if (open && data) {
      // If the dialog is open and there is data, pre-fill the form
      setFormData((prevData) => ({ ...prevData, ...data }));
    }
    // setFormErrors({});
  }, [open, data]);

  useEffect(() => {
    // Similarly, check for skills array
    if (formData?.skills && formData.skills.length > 0) {
      const skillsIds = formData.skills.map((item: any) => item.id || []);
      setSelectedSkillids(skillsIds);
    }

    // Check for machines_variant array
    if (formData?.machines_variant && formData.machines_variant.length > 0) {
      const machinesVariantIds = formData.machines_variant.map(
        (item: any) => item.id || []
      );
      setSelectedMachineVariantids(machinesVariantIds);
    }
  }, []);

  const handleSave = async () => {
    if (onSave) {
      const formDataWithIds = {
        ...formData,
        ...(selectedSkillids.length > 0 && { skill_ids: selectedSkillids }),
        ...(selectedMachineVariantids.length > 0 && {
          machine_variant_ids: selectedMachineVariantids,
        }),
      };
      await onSave(formDataWithIds);
    }
  };

  const handleInputChange = (key: string, value: string | number) => {
    onInputChange?.(key, value);
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleSkillsChange = (id: number, checked: boolean) => {
    // If the checkbox is checked, add the id to the selectedSkillids array
    // If unchecked, remove the id from the selectedSkillids array
    setSelectedSkillids((prevIds) => {
      if (checked) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });
  };

  const handleMachineVariantChange = (id: number, checked: boolean) => {
    // If the checkbox is checked, add the id to the selectedSkillids array
    // If unchecked, remove the id from the selectedSkillids array
    setSelectedMachineVariantids((prevIds) => {
      if (checked) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });
  };

  // React Component: Render the UI
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit AMC'
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
        <div className='flex grow flex-col gap-5 overflow-auto p-4'>
          <div className='grid grid-cols-1  gap-5'>
            <InputField
              isRequired
              type='text'
              label='Title:'
              value={formData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={formErrors?.amc_code || ''}
            />
          </div>
          <div className='w-full'>
            <Card className='h-full overflow-hidden'>
              <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                <CardTitle className='text-lg font-normal'>SKILLS</CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='grid grid-cols-4 gap-4'>
                  {helperData &&
                    helperData?.skill?.map((item: any) => (
                      <>
                        <CheckboxItem
                          key={item.id}
                          checked={selectedSkillids.includes(item.id)} // Check if the current brand id is in the selectedSkillids array
                          onCheckedChange={(checked) =>
                            handleSkillsChange(item.id, checked)
                          }
                          ariaLabel={item?.name}
                          id={`skill_${item.id}`}
                        />
                      </>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='w-full'>
            <Card className='h-full overflow-hidden'>
              <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                <CardTitle className='text-lg font-normal'>
                  MACHINE VARIANTS
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='grid grid-cols-4 gap-4'>
                  {helperData &&
                    helperData?.machine_variant?.map((item: any) => (
                      <>
                        <CheckboxItem
                          key={item.id}
                          checked={selectedMachineVariantids.includes(item.id)} // Check if the current brand id is in the selectedSkillids array
                          onCheckedChange={(checked) =>
                            handleMachineVariantChange(item.id, checked)
                          }
                          ariaLabel={item?.name}
                          id={`machine_variants_${item.id}`}
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

export default AddGrades;
