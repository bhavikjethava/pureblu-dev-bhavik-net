import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InputField from '@/components/InputField';
import SelectBox from '@/components/SelectBox';
import MyDialog from '@/components/MyDialog';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import {
  IconBxErrorCircle,
  IconCalendarDays,
  IconDeleteBinLine,
  IconLoading,
} from '@/utils/Icons';
import ROUTES, { CITY, OptionType, STATE, getBaseUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { showToast } from '../components/Toast';
import { isRequired } from '@/utils/ValidationUtils';
import 'react-datepicker/dist/react-datepicker.css';
import DatepickerComponent from './DatePicker';
import moment from 'moment';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Button } from './ui/button';
// import Combobox from './ComboBox';

interface AddDeviceProps {
  open: boolean;
  branchList?: any;
  selectedData?: any;
  brandList?: any;
  machineTypeList?: any;
  variantList?: any;
  machineModelList?: any;
  selectedCustomerID?: any;
  helperData?: any;
  onClose?: () => void;
  onSave?: (newData: any) => void;
  apiBaseUrl: any;
  onBrandChange?: (brandId: number) => void;
}

interface FormData {
  [key: string]: any;
}

interface DeviceType {
  units: any[];
}

const AddDevice: React.FC<AddDeviceProps> = ({
  open,
  onClose,
  brandList,
  branchList,
  selectedData,
  machineTypeList,
  machineModelList,
  variantList,
  helperData,
  apiBaseUrl,
  selectedCustomerID,
  onSave,
  onBrandChange,
}) => {
  const [unitsCount, setUnitsCount] = useState<number>(1);

  const [selectedformData, setselectedFormData] = useState<FormData>({
    ...selectedData,
    units: [{ id: 0, isSaved: false }], // Initialize with one unit
    // Add other initial fields if needed
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormData>();
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  const [openDropdown, setOpenDropdown] = useState(false);

  const unitType = [
    { id: 1, name: 'Indoor Unit' },
    { id: 2, name: 'Outdoor Unit' },
    { id: 3, name: 'Remote Control' },
  ];

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

  const handleUnitInputChange = (
    unitIndex: number,
    field: string,
    value: any,
    file?: any
  ) => {
    // Create a copy of the current state
    const updatedFormData = { ...selectedformData };

    // Create a copy of the units array
    const updatedUnits = [...updatedFormData.units];

    // If the unit at the specified index exists, update its field
    if (unitIndex < updatedUnits.length) {
      updatedUnits[unitIndex] = {
        ...updatedUnits[unitIndex],
        [field]: value,
      };
    } else {
      // If the unit at the specified index does not exist, create a new unit object
      updatedUnits[unitIndex] = { [field]: value };
    }

    // Update the units array in the copied state
    updatedFormData.units = updatedUnits;

    // Set the state with the updated form data
    setselectedFormData(updatedFormData);

    // If a file is provided, update the state with the file data
    if (file) {
      if (unitIndex < updatedUnits.length) {
        updatedUnits[unitIndex] = {
          ...updatedUnits[unitIndex],
          [field]: file,
        };
      } else {
        // If the unit at the specified index does not exist, create a new unit object
        updatedUnits[unitIndex] = { [field]: file };
      }
      setselectedFormData((prevData) => ({
        ...prevData,
        [field]: file,
      }));
    }
    if (field == 'brand_id' && value) {
      onBrandChange?.(value);
    }
  };

  const handleFileInputChange = (unitIndex: number, field: string, e: any) => {
    if (e?.target?.files) {
      let files = Array.from(e.target.files);
      handleUnitInputChange(unitIndex, field, files, files);
    }
  };

  const handleSaveDevice = async () => {
    try {
      // Start the loading state
      setLoading(true);
      const isEdit = selectedformData?.id;
      const data = new FormData();

      // Serialize the units' data
      selectedformData.units.forEach((unit: any, index: number) => {
        // Append only if the field exists in the unit object
        if (unit.brand_id) {
          data.append(`units[${index}][brand_id]`, unit.brand_id);
        }
        if (unit.unit_type_id) {
          data.append(`units[${index}][unit_type_id]`, unit.unit_type_id);
        }
        if (unit.machine_model_id) {
          data.append(
            `units[${index}][machine_model_id]`,
            unit.machine_model_id
          );
        }
        if (unit.refrigerant_id) {
          data.append(`units[${index}][refrigerant_id]`, unit.refrigerant_id);
        }
        if (unit.cooling_coil_type_id) {
          data.append(
            `units[${index}][cooling_coil_type_id]`,
            unit.cooling_coil_type_id
          );
        }
        if (unit.equipment_id) {
          data.append(`units[${index}][equipment_id]`, unit.equipment_id);
        }
        if (unit.compressor_make) {
          data.append(`units[${index}][compressor_make]`, unit.compressor_make);
        }
        if (unit.compressor_type) {
          data.append(`units[${index}][compressor_type]`, unit.compressor_type);
        }
        if (unit.site_requirement) {
          data.append(
            `units[${index}][site_requirement]`,
            unit.site_requirement
          );
        }
        if (unit.serial_number) {
          data.append(`units[${index}][serial_number]`, unit.serial_number);
        }
        if (unit.note) {
          data.append(`units[${index}][note]`, unit.note);
        }
        if (unit.capacity) {
          data.append(`units[${index}][capacity]`, unit.capacity);
        }
        if (unit.unit_image) {
          unit.unit_image.forEach((image: any, imageIndex: number) => {
            data.append(`units[${index}][image][${imageIndex}]`, image);
          });
        }
      });

      Object.keys(selectedformData).map((key) => {
        if (
          key == 'id' ||
          key == 'old_id' ||
          key == 'is_old' ||
          key == 'created_at' ||
          key == 'updated_at' ||
          key == 'deleted_at' ||
          key == 'branch' ||
          key == 'brand' ||
          key == 'machine_type' ||
          key == 'allCity' ||
          key == 'units' ||
          key == 'unit_image' ||
          key == 'machine_variant'
        )
          return;

        let value = selectedformData[key];

        // Format date if it's a date field
        if (key === 'installed_on' &&  value) {
          value = moment(value).format('YYYY-MM-DD HH:mm:ss');
        }
        data.append(key, value);
      });

      const valifationRules = [
        {
          field: 'name',
          value: selectedformData?.name,
          message: 'Device Name',
        },
        {
          field: 'branch_id',
          value: selectedformData?.branch_id,
          message: 'Branch',
        },
        {
          field: 'machine_type_id',
          value: selectedformData?.machine_type_id,
          message: 'Machine Type',
        },
        {
          field: 'brand_id',
          value: selectedformData?.brand_id,
          message: 'Brand',
        },
        {
          field: 'machine_variant_id',
          value: selectedformData?.machine_variant_id,
          message: 'Variant',
        },
        {
          field: 'installed_on',
          value: selectedformData?.installed_on,
          message: 'Installed on',
        },
      ];

      // Add validation rules for each dynamically created subfield in 'units'
      if (selectedformData.units && selectedformData.units.length > 0) {
        selectedformData.units.forEach((unit: any, index: number) => {
          // Dynamically generate validation rules for each subfield of the unit
          let unitValidationRules: any = [];
          if (
            unit.brand_id ||
            unit.unit_type_id ||
            unit?.machine_model_id ||
            unit.refrigerant_id ||
            unit.cooling_coil_type_id ||
            unit.equipment_id
          ) {
            unitValidationRules = [
              {
                field: `units.${index}.brand_id`,
                value: unit.brand_id,
                message: `Brand`,
              },
              {
                field: `units.${index}.unit_type_id`,
                value: unit.unit_type_id,
                message: `Unit type`,
              },
              // {
              //   field: `units.${index}.refrigerant_id`,
              //   value: unit.refrigerant_id,
              //   message: `Refrigerant`,
              // },
              // {
              //   field: `units.${index}.machine_model_id`,
              //   value: unit.machine_model_id,
              //   message: `Model number`,
              // },
              // {
              //   field: `units.${index}.equipment_id`,
              //   value: unit.equipment_id,
              //   message: `Equipment`,
              // },
              // {
              //   field: `units.${index}.cooling_coil_type_id`,
              //   value: unit.cooling_coil_type_id,
              //   message: `Cooling coil type`,
              // },
            ];
          }

          // Merge the unit validation rules with the main validation rules
          valifationRules.push(...unitValidationRules);
        });
      }

      let { isError, errors } = validateForm(valifationRules);

      if (isError) {
        setErrors(errors);
      } else {
        let apiUrl = `${apiBaseUrl.CUSTOMERS}/${selectedCustomerID}/device`;

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

  const addUnit = () => {
    setUnitsCount((prevCount) => prevCount + 1);
    setselectedFormData((prevData) => ({
      ...prevData,
      units: [...prevData.units, { id: unitsCount }],
    }));
  };

  const removeUnit = (unitIndex: number) => {
    if (selectedformData.units.length > 1) {
      // Create a copy of the units array
      const updatedUnits = [...selectedformData.units];

      // Remove the unit at the specified index
      updatedUnits.splice(unitIndex, 1);

      // Update the units array in the state
      setselectedFormData((prevData) => ({
        ...prevData,
        units: updatedUnits,
      }));

      // Update the units count if necessary
      setUnitsCount((prevCount) => prevCount - 1);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Device'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
      buttons={[
        {
          text: 'Add Unit',
          variant: 'blue',
          size: 'lg',
          onClick: addUnit,
          className: 'mr-auto',
        },
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: handleSaveDevice,
          btnLoading: loading,
          icon: loading ? <IconLoading /> : '',
        },
      ]}
    >
      <ScrollArea className='grow'>
        <div className='flex grow flex-col overflow-auto p-4'>
          <div className='mb-5 grid grid-cols-2 gap-5'>
            <InputField
              type='text'
              label='Name'
              isRequired
              value={selectedformData?.name || ''}
              onChange={(e) => handleInputChange('name', e)}
              error={errors?.name || ''}
            />
            <SelectBox
              isRequired
              label='Branch'
              options={branchList}
              value={selectedformData.branch_id || ''}
              onChange={(e) => handleInputChange('branch_id', Number(e))}
              error={errors?.branch_id || ''}
            />
            <SelectBox
              isRequired
              label='Brands'
              options={brandList}
              value={selectedformData.brand_id || ''}
              onChange={(e) => handleInputChange('brand_id', Number(e))}
              error={errors?.brand_id || ''}
            />
            <SelectBox
              isRequired
              label='Machine Type'
              options={machineTypeList}
              value={selectedformData.machine_type_id || ''}
              onChange={(e) => handleInputChange('machine_type_id', Number(e))}
              error={errors?.machine_type_id || ''}
            />
            <SelectBox
              isRequired
              label='Variant'
              options={variantList}
              value={selectedformData.machine_variant_id || ''}
              onChange={(e) =>
                handleInputChange('machine_variant_id', Number(e))
              }
              error={errors?.machine_variant_id || ''}
            />
            <DatepickerComponent
              isRequired
              label='Installed on' // User can pass the label text here
              dateFormat='dd/MM/yyyy'
              onChange={(e) => handleInputChange('installed_on', e)}
              selectedDate={selectedformData.installed_on}
              error={errors?.installed_on || ''}
              // onChange={handleDateChange}
            />
          </div>
          <Accordion type='single' collapsible>
            {selectedformData.units.map((unit: any, index: number) => (
              <>
                <AccordionItem
                  value={`sub-item-${index}`}
                  key={index}
                  className='border no-underline '
                >
                  <AccordionTrigger
                    // disabled={unit.isSaved} // Disable the accordion if units are saved
                    className='bg-pbHeaderBlue px-4 text-left text-white hover:no-underline'
                  >
                    <div className='grid w-full grid-cols-2 items-center'>
                      <div className='col-span-1'>
                        <div className='text-sm font-bold'>Attached Units</div>
                      </div>
                      {selectedformData.units.length > 1 && (
                        <div className='ml-auto mr-5'>
                          <Button
                            className='h-auto p-0'
                            variant={'icon'}
                            size={'sm'}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the event from bubbling up
                              removeUnit(index);
                            }}
                          >
                            <IconDeleteBinLine className='h-5 w-5' />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='p-4'>
                    <div className='mb-5 grid grid-cols-2 gap-5'>
                      <SelectBox
                        isRequired
                        label='Brands'
                        options={brandList}
                        value={unit.brand_id || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'brand_id', Number(e))
                        }
                        error={errors?.[`units.${index}.brand_id`] || ''}
                      />
                      <SelectBox
                        isRequired
                        label='Unit Type'
                        options={unitType}
                        value={unit.unit_type_id || ''}
                        onChange={(e) =>
                          handleUnitInputChange(
                            index,
                            'unit_type_id',
                            Number(e)
                          )
                        }
                        error={errors?.[`units.${index}.unit_type_id`] || ''}
                      />
                      <SelectBox
                        // isRequired
                        label='Model Number'
                        options={machineModelList}
                        optionKey='id' // Set the key for options
                        optionValue='model_number' // Set the value for options
                        onChange={(e) =>
                          handleUnitInputChange(
                            index,
                            'machine_model_id',
                            Number(e)
                          )
                        }
                        error={
                          errors?.[`units.${index}.machine_model_id`] || ''
                        }
                      />
                      {/* <Combobox
                        options={machineModelList}
                        value={unit.machine_model_id}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'machine_model_id', e)
                        }
                        open={openDropdown}
                        onOpenChange={setOpenDropdown}
                      /> */}
                      <SelectBox
                        label='Refrigerant'
                        options={helperData?.data?.refrigerant}
                        value={unit.refrigerant_id || ''}
                        onChange={(e) =>
                          handleUnitInputChange(
                            index,
                            'refrigerant_id',
                            Number(e)
                          )
                        }
                        error={errors?.[`units.${index}.refrigerant_id`] || ''}
                      />
                      <SelectBox
                        label='Cooling Coil Type'
                        options={helperData?.data?.condensor_cooling_coil_type}
                        value={unit.cooling_coil_type_id || ''}
                        onChange={(e) =>
                          handleUnitInputChange(
                            index,
                            'cooling_coil_type_id',
                            Number(e)
                          )
                        }
                        error={
                          errors?.[`units.${index}.cooling_coil_type_id`] || ''
                        }
                      />{' '}
                      <SelectBox
                        label='Equipment'
                        options={helperData?.data?.equipment}
                        value={unit.equipment_id || ''}
                        onChange={(e) =>
                          handleUnitInputChange(
                            index,
                            'equipment_id',
                            Number(e)
                          )
                        }
                        error={errors?.[`units.${index}.equipment_id`] || ''}
                      />
                      <InputField
                        type='text'
                        label='Compressor Make'
                        value={unit.compressor_make || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'compressor_make', e)
                        }
                        error={errors?.[`units.${index}.compressor_make`] || ''}
                      />
                      <InputField
                        type='text'
                        label='Compressor Type'
                        value={unit.compressor_type || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'compressor_type', e)
                        }
                        error={errors?.[`units.${index}.compressor_type`] || ''}
                      />
                      <InputField
                        type='text'
                        label='Site Requirement'
                        value={unit.site_requirement || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'site_requirement', e)
                        }
                        error={
                          errors?.[`units.${index}.site_requirement`] || ''
                        }
                      />
                      <InputField
                        type='text'
                        label='Unit Serial'
                        value={unit.serial_number || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'serial_number', e)
                        }
                        error={errors?.[`units.${index}.serial_number`] || ''}
                      />
                      <InputField
                        type='text'
                        label='Unit Note'
                        value={unit.note || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'note', e)
                        }
                        error={errors?.[`units.${index}.note`] || ''}
                      />
                      <InputField
                        type='text'
                        label='Capacity'
                        value={unit.capacity || ''}
                        onChange={(e) =>
                          handleUnitInputChange(index, 'capacity', e)
                        }
                        error={errors?.[`units.${index}.capacity`] || ''}
                      />
                      <InputField
                        type='file'
                        label='Unit image'
                        accept='image/jpeg, image/png'
                        multiple
                        onChange={(e) =>
                          handleFileInputChange(index, 'unit_image', e)
                        }
                        error={errors?.[`units.${index}.unit_image`] || ''}
                        className={'w-full'}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddDevice;
