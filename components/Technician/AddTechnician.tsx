import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import SelectBox from '@/components/SelectBox';
import MyDialog from '@/components/MyDialog';
import CountrySelectBox from '@/components/CountrySelectBox';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import CheckboxItem from '@/components/CheckboxItem';
import { IconLoading } from '@/utils/Icons';
import Image from 'next/image';
import ROUTES, { CITY, OptionType, STATE, getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import StateSelectBox from '../StateSelectBox';

interface AddTechnicianProps {
  open: boolean;
  selectedData?: any;
  helperData?: any;
  onInputChange?: (key: string, value: any) => void;
  partnerList: Array<OptionType>;
  onClose?: () => void;
  onSave?: (newData: any) => void;
  formErrors?: { [key: string]: string };
  loading?: boolean;
}

interface FormData {
  [key: string]: any;
}

const statusList = [
  { id: -1, name: 'Select' },
  { id: 1, name: 'Active' },
  { id: 2, name: 'Inactive' },
  // { id: 3, name: 'Disabled' },
];

const AddTechnician: React.FC<AddTechnicianProps> = ({
  open,
  onClose,
  selectedData,
  helperData,
  onInputChange,
  onSave,
  loading,
  partnerList,
  formErrors = {}, // Default value for errors
}) => {
  const [selectedformData, setselectedFormData] = useState<FormData>({
    ...selectedData,
  });
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);
  const [profile_image, setProfileImage] = useState<string | null>(null);

  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const { stateList, cityList, setStateList, setCityList, fetchRequest } =
    useStateCity();

  useEffect(() => {
    // If adding a new technician, check all checkboxes by default
    if (selectedData?.isNew) {
      setSelectedBrandIds(helperData?.brand?.map((item: any) => item.id) || []);
      setSelectedSkillIds(helperData?.skill?.map((item: any) => item.id) || []);
      setSelectedMachineIds(
        helperData?.machine?.map((item: any) => item.id) || []
      );
    } else {
      if (selectedData?.state_id) {
        setCityList(selectedData.allCity);
        fetchRequest(CITY, selectedData.state_id);
      }

      // Check if brands array has elements before processing
      if (selectedData?.brands && selectedData.brands.length > 0) {
        const brandIds = selectedData.brands.map(
          (item: any) => item.brand_id || []
        );
        setSelectedBrandIds(brandIds);
      }

      // Similarly, check for skills array
      if (selectedData?.skills && selectedData.skills.length > 0) {
        const skillsIds = selectedData.skills.map(
          (item: any) => item.skill_id || []
        );
        setSelectedSkillIds(skillsIds);
      }

      // Check for machines_variant array
      if (
        selectedData?.machines_variant &&
        selectedData?.machines_variant.length > 0
      ) {
        const machinesVariantIds = selectedData.machines_variant.map(
          (item: any) => item.machine_variant_id || []
        );
        setSelectedMachineIds(machinesVariantIds);
      }
    }

    setselectedFormData(selectedData);
  }, [selectedData, helperData]);

  const handleInputChange = (key: string, value: any) => {
    onInputChange?.(key, value);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleCountryChage = (key: string, value: number) => {
    onInputChange?.(key, value);
    setCityList([]);
    fetchRequest(STATE, value);
    // remove selected state and city
    onInputChange?.('state_id', null);
    onInputChange?.('city_id', null);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleStateChage = (key: string, value: number) => {
    onInputChange?.('city_id', null);
    onInputChange?.(key, value);
    fetchRequest(CITY, value);
    setCityList([]);
    setselectedFormData((prevData) => ({ ...prevData, [key]: value }));
    setselectedFormData((prevData) => ({ ...prevData, city_id: null }));
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

  const handleFileInputChange = (key: string, e: any) => {
    if (e?.target?.files && e?.target?.files[0]) {
      let file = e.target.files[0];
      setselectedFormData((prevData) => ({ ...prevData, [key]: file }));
      onInputChange?.(key, file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSkillChange = (id: number, checked: boolean) => {
    // If the checkbox is checked, add the id to the selectedSkillIds array
    // If unchecked, remove the id from the selectedSkillIds array
    setSelectedSkillIds((prevIds) => {
      if (checked) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });
  };

  const handleMachineChange = (id: number, checked: boolean) => {
    // If the checkbox is checked, add the id to the selectedSkillIds array
    // If unchecked, remove the id from the selectedSkillIds array
    setSelectedMachineIds((prevIds) => {
      if (checked) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });
  };

  const handleSave = async () => {
    if (onSave) {
      const formDataWithIds = {
        ...selectedformData,
        brand_ids: selectedBrandIds || [],
        skill_ids: selectedSkillIds || [],
        machine_variant_ids: selectedMachineIds || [],
      };

      await onSave(formDataWithIds);
    }
  };

  const handleSelectAllBrands = (checked: boolean) => {
    if (checked) {
      setSelectedBrandIds(helperData.brand.map((item: any) => item.id));
    } else {
      setSelectedBrandIds([]);
    }
  };

  const handleSelectAllMachines = (checked: boolean) => {
    if (checked) {
      setSelectedMachineIds(helperData.machine.map((item: any) => item.id));
    } else {
      setSelectedMachineIds([]);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Technician'
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
              label='Technician Name'
              isRequired
              value={selectedformData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={formErrors?.name || ''}
            />
            <SelectBox
              isRequired
              label='Partner'
              disabled={isPBPartner}
              options={partnerList}
              value={selectedformData?.partner_id || ''}
              onChange={(e) => handleInputChange('partner_id', e)}
              error={formErrors?.partner_id || ''}
            />
            <InputField
              type='text'
              label='Email'
              isRequired
              value={selectedformData?.email || ''}
              onChange={(e) => handleInputChange('email', e)}
              error={formErrors?.email || ''}
            />
            <InputField
              type='text'
              label='Mobile No'
              isRequired
              value={selectedformData?.phone || ''}
              onChange={(e) => handleInputChange('phone', e)}
              error={formErrors?.phone || ''}
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
              label='Locality'
              isRequired
              value={selectedformData?.locality || ''}
              onChange={(e) => handleInputChange('locality', e)}
              error={formErrors?.locality || ''}
            />{' '}
            {/* <CountrySelectBox
              isRequired
              label='Country'
              options={helperData?.data?.country}
              value={selectedformData?.country_id || null}
              onChange={(e) => handleCountryChage('country_id', e)}
              error={formErrors?.country_id || ''}
            /> */}
            <StateSelectBox
              label='State'
              value={selectedformData?.state_id || ''}
              onChange={(e) => handleStateChage('state_id', Number(e))}
              error={formErrors?.state_id || ''}
              isRequired
            />
            <SelectBox
              isRequired
              key={selectedformData?.state_id || 0}
              label='City'
              options={cityList}
              value={selectedformData?.city_id || null}
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
            <SelectBox
              isRequired
              label='Status'
              options={statusList}
              value={selectedformData?.status || 0}
              onChange={(e) => handleInputChange('status', Number(e))}
              error={formErrors?.status || ''}
            />
          </div>

          <div className='my-3 flex w-full flex-col gap-5 lg:my-5 lg:flex-row'>
            <div className='w-full'>
              <Card className='h-full overflow-hidden'>
                <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                  <CardTitle className='text-lg font-normal'>
                    Profile photo
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-4 p-4'>
                  <InputField
                    type='file'
                    label=''
                    accept='image/*'
                    onChange={(e) => handleFileInputChange('profile_image', e)}
                    error={formErrors?.profile_image || ''}
                    className={'w-full'}
                  />
                  {profile_image ? (
                    <Image
                      src={profile_image}
                      alt={'profile_image'}
                      height={108}
                      width={108}
                    />
                  ) : selectedformData?.profile_image ? (
                    <Image
                      src={selectedformData?.profile_image}
                      alt={'profile_image'}
                      height={108}
                      width={108}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </div>
            <div className='w-full'>
              <Card className='h-full overflow-hidden'>
                <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                  <CardTitle className='text-lg font-normal'>Skills</CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='grid grid-cols-4 gap-4'>
                    {helperData &&
                      helperData?.skill?.map((item: any) => (
                        <div key={item?.id}>
                          <CheckboxItem
                            key={item.id}
                            checked={selectedSkillIds?.includes(item.id)} // Check if the current brand id is in the selectedBrandIds array
                            onCheckedChange={(checked) =>
                              handleSkillChange(item.id, checked)
                            }
                            ariaLabel={item?.name}
                            id={`skill_${item.id}`}
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className='my-3 flex w-full gap-5 lg:my-5'>
            <div className='w-full'>
              <Card className='h-full overflow-hidden'>
                <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                  <CardTitle className='text-lg font-normal'>Brands</CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='mb-6'>
                    <CheckboxItem
                      checked={
                        selectedBrandIds.length === helperData?.brand?.length
                      }
                      onCheckedChange={(checked) =>
                        handleSelectAllBrands(checked)
                      }
                      ariaLabel='Select All'
                      id='select_all_brands'
                    />
                  </div>
                  <div className='grid grid-cols-4 gap-4'>
                    {helperData &&
                      helperData?.brand?.map((item: any) => (
                        <div key={item?.id}>
                          <CheckboxItem
                            key={item.id}
                            checked={selectedBrandIds?.includes(item.id)} // Check if the current brand id is in the selectedBrandIds array
                            onCheckedChange={(checked) =>
                              handleBrandChange(item.id, checked)
                            }
                            ariaLabel={item?.name}
                            id={`brand_${item.id}`}
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className='my-3 flex w-full gap-5 lg:my-5'>
            <div className='w-full'>
              <Card className='h-full overflow-hidden'>
                <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                  <CardTitle className='text-lg font-normal'>Machine</CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='mb-6'>
                    <CheckboxItem
                      checked={
                        selectedMachineIds.length ===
                        helperData?.machine?.length
                      }
                      onCheckedChange={(checked) =>
                        handleSelectAllMachines(checked)
                      }
                      ariaLabel='Select All'
                      id='select_all_machines'
                    />
                  </div>
                  <div className='grid grid-cols-4 gap-4'>
                    {helperData &&
                      helperData?.machine?.map((item: any) => (
                        <div key={item?.id}>
                          <CheckboxItem
                            key={item.id}
                            checked={selectedMachineIds?.includes(item.id)} // Check if the current brand id is in the selectedBrandIds array
                            onCheckedChange={(checked) =>
                              handleMachineChange(item.id, checked)
                            }
                            ariaLabel={item?.name}
                            id={`machine_${item.id}`}
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddTechnician;
