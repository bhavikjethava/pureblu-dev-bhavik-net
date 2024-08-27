import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import SearchInput from '../SearchInput';
import SelectBox from '../SelectBox';
import { Button } from '../ui/button';
import {
  IconAddLine,
  IconBxErrorCircle,
  IconDeleteBinLine,
  IconLoading,
  IconPencil,
} from '@/utils/Icons';
import AddDevice from '../AddDevice';
import { ScrollArea } from '../ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import moment from 'moment';
import { DataContext } from '@/context/dataProvider';
import ROUTES, {
  ArrayProps,
  BRANCHLIST,
  CUSTOMER,
  DEVICELIST,
  HELPERSDATA,
  HelperData,
  OptionType,
  PARTNERS,
  REFRESHDIVELIST,
  TEXTAREA,
  deleteArrayItem,
  getBaseUrl,
  getStatusString,
  updateArray,
} from '@/utils/utils';
import EditableField from '../EditableField';
import { validateForm } from '@/utils/FormValidationRules';
import { showToast } from '../Toast';
import InputField from '../InputField';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import ConfirmationDialog from '../ConfirmationDialog';
import MyDialog from '../MyDialog';
import { isRequired } from '@/utils/ValidationUtils';
import { useAccessRights } from '@/hooks/useAccessRights';
import Loader from '../Loader';
import ZoomImageModal from '../ZoomImageModal';

interface UserTypes {
  [key: string]: any;
}

const UnitDetails = ({ apiBaseUrl }: any) => {
  const { id } = useParams();
  const { state, setData } = useContext(DataContext);
  const apiAction = useMutation(apiCall);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setselectedItem] = useState<UserTypes>();
  const [selectedUnitImageData, setSelectedUnitImage] = useState<UserTypes>();
  const [branchList, setBranchList] = useState<UserTypes>();
  const [brandList, setBrandList] = useState();
  const [machineTypeList, setMachineTypeList] = useState<Array<UserTypes>>();
  const [variantList, setVariantList] = useState<Array<UserTypes>>();
  const [deviceList, setDeviceList] = useState<Array<UserTypes>>([]);
  const [filteredDeviceData, setfilteredDeviceData] = useState<
    Array<UserTypes>
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(-1);
  const [helperData, setHelperData] = useState<HelperData>();
  const [editMode, setEditMode] = useState(false);
  const [selectedUnitData, setselectedUnitData] = useState<UserTypes>();
  const [showModal, setshowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<UserTypes>();
  const [filterBranch, setFilterBranch] = useState<Array<OptionType>>([]);
  const [unitImage, setUnitImage] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(10); // State variable to control the number of records to display
  const [machineModelList, setMachineModelList] = useState([]);
  const [isConfirmation, setConfirmation] = useState(false);
  const [isDeleteUnitImage, setDeleteUnitImage] = useState(false);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [amcInfo, setAMCinfo] = useState<any>({});
  const [aMCInfoLoader, setAMCInfoLoader] = useState(false);
  const [partnerList, setPartnerList] = useState<
    Array<{ [Key: string]: string }>
  >([]);
  const [selectedDevice, setSelectedDevice] = useState<{
    [Key: string]: any;
  }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBenterPrise = basePath == ROUTES.PBENTERPRISE;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const { isAccess } = useAccessRights();

  const unitType = [
    { id: 1, name: 'Indoor Unit' },
    { id: 2, name: 'Outdoor Unit' },
    { id: 3, name: 'Remote Control' },
    // Add more items as needed
  ];

  useEffect(() => {
    if (!isEnterprise) {
      fetchBrandList();
      fetchMachineTypeList();
      fetchVariantList();
      // fetchMachineModelList();
    }
  }, []);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      setHelperData((pre: any) => {
        return {
          ...pre,
          data: state?.[HELPERSDATA],
        };
      });
    }
  }, [state?.[HELPERSDATA]]);

  useEffect(() => {
    setBranchList(state?.[BRANCHLIST]);
    let tempBranchList: Array<OptionType> = [];
    if (state?.[BRANCHLIST]) tempBranchList = [...state?.[BRANCHLIST]];
    tempBranchList.unshift({ id: -1, name: 'All Branches' });
    setFilterBranch(tempBranchList);
  }, [state?.[BRANCHLIST]]);

  useEffect(() => {
    setDeviceList(state?.[DEVICELIST]);
  }, [state?.[DEVICELIST]]);

  useEffect(() => {
    const filteredDeviceData = deviceList?.filter((item: any) => {
      // Add filtering logic based on selectedBranchId
      const matchesBranchId =
        selectedBranchId === -1 || item.branch_id === selectedBranchId;
      // Add existing search term filtering logic
      const matchesSearchTerm = Object.values(
        item as { [key: string]: unknown }
      ).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesBranchId && matchesSearchTerm;
    });

    setfilteredDeviceData(filteredDeviceData);
    setDisplayLimit(10); // Reset display limit
  }, [searchTerm, selectedBranchId, deviceList]);

  useEffect(() => {
    if (isPBenterPrise) {
      setPartnerList(state?.[PARTNERS]);
    }
  }, [state?.[PARTNERS]]);

  useEffect(() => {
    if (isPBenterPrise && state?.[PARTNERS] == undefined) {
      fetchPartner();
    }
  }, []);

  const onBrandChange = (brandId: number) => {
    fetchMachineModelList(brandId);
  };

  const fetchPartner = async () => {
    try {
      const fetchPartner = {
        endpoint: `${apiBaseUrl.PARTNER_USER}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchPartner);
      if (data) {
        setData({ [PARTNERS]: data });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchMachineModelList = async (brandId: number) => {
    try {
      const fetchMachineType = {
        endpoint: `${apiBaseUrl.MACHINEMODEL}?need_all=1&brand_id=${brandId}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchMachineType);
      if (data) {
        // Add "NA" to the beginning or end of the list, depending on your requirement
        const updatedMachineModelList: any = [
          { id: 0, model_number: 'NA' },
          ...data,
        ];
        setMachineModelList(updatedMachineModelList);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchVariantList = async () => {
    try {
      const fetchVariant = {
        endpoint: `${apiBaseUrl.MACHINEVARIANT}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchVariant);
      if (data) setVariantList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchBrandList = async () => {
    try {
      const fetchBrand = {
        endpoint: `${apiBaseUrl.BRAND}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchBrand);
      if (data) setBrandList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchMachineTypeList = async () => {
    try {
      const fetchMachineType = {
        endpoint: `${apiBaseUrl.MACHINETYPE}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchMachineType);
      if (data) setMachineTypeList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleAddDeviceClick = () => {
    // Logic to open the AddAdmin modal
    setshowModal(true);
    setselectedItem({
      isNew: true,
    });
  };

  const handleDeviceEditClick = (rowData: any) => {
    setselectedItem({
      ...rowData,
    });
    setshowModal(true);
    setErrors({});
  };

  const handleSave = async (response: any) => {
    setData({ [REFRESHDIVELIST]: !state?.[REFRESHDIVELIST] });
  };

  const handleSaveDevicesUnit = async (unitId: number, deviceId: number) => {
    try {
      // Start the loading state
      setLoading(true);
      // Check if selectedUnitData is defined before proceeding
      if (!selectedUnitData) {
        console.error('selectedUnitData is undefined.');
        return;
      }

      const formData = new FormData();
      Object.entries(selectedUnitData).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          value !== 0 && // Only add fields with a value
          ![
            'id',
            'old_id',
            'created_at',
            'updated_at',
            'deleted_at',
            'country',
            'state',
            'city',
            'allCity',
            'units',
            'brand',
            'unit_type',
            'is_old',
            'machine_model',
          ].includes(key)
        ) {
          if (key === 'unit_image' && Array.isArray(value)) {
            value.forEach((image: any, imageIndex: number) => {
              if (image instanceof File) {
                formData.append(`image[${imageIndex}]`, image);
              }
            });
          } else {
            formData.append(key, value);
          }
          // formData.append(key, value);
        }
      });

      const valifationRules = [
        {
          field: 'brand_id',
          value: selectedUnitData?.brand_id,
          message: 'Brand',
        },
      ];

      let { isError, errors } = validateForm(valifationRules);

      if (isError) {
        setErrors(errors);
      } else {
        let apiUrl = `${apiBaseUrl.CUSTOMERS}/${id}/device/${deviceId}/unit/${unitId}?_method=patch`;

        const units = {
          endpoint: apiUrl,
          method: 'POST',
          body: formData,
          isFormData: true,
        };

        const { data, isError, errors } = await apiAction.mutateAsync(units);
        if (isError) {
          setErrors(errors);
        } else {
          const deviceIndex = deviceList.findIndex(
            (device) => device.id == deviceId
          );
          if (deviceIndex > -1) {
            let tempunitList = updateArray(
              (deviceList[deviceIndex]?.units as Array<ArrayProps>) || [],
              data
            );
            let list = deviceList;

            list[deviceIndex].units = tempunitList;
            // Set the updated deviceList
            setDeviceList([...list]);
          }
          setErrors({});
          setEditMode(false);
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

  const handleSelectChange = (
    key: string,
    deviceIndex: number,
    unitIndex: number,
    newValue: any
  ) => {
    setselectedUnitData((prevData) => ({ ...prevData, [key]: newValue }));
    if (key === 'brand_id') {
      fetchMachineModelList(newValue);
    }
  };

  const handleUnitEditClick = (unit: any) => {
    setselectedUnitData(unit);
    setEditMode(!editMode);
    if (unit?.brand_id) {
      fetchMachineModelList(unit?.brand_id);
    } else {
      setMachineModelList([]);
    }
    //
  };

  const handleFileInputChange = (key: string, e: any) => {
    if (e?.target?.files) {
      const filesArray = Array.from(e.target.files);
      setselectedUnitData((prevData) => ({
        ...prevData,
        [key]: filesArray,
      }));
    }
  };

  const deleteUnitImage = async () => {
    try {
      // Start the loading state

      setLoading(true);
      let apiUrl = `${apiBaseUrl.CUSTOMERS}/${id}/device/${selectedUnitImageData?.deviceId}/unit/${selectedUnitImageData?.unitId}/image/${selectedUnitImageData?.imageId}`;

      const units = {
        endpoint: apiUrl,
        method: 'DELETE',
      };

      const { data, isError, errors } = await apiAction.mutateAsync(units);
      if (isError) {
        setErrors(errors);
      } else {
        const deviceIndex = deviceList.findIndex(
          (device) => device.id == selectedUnitImageData?.deviceId
        );
        if (deviceIndex > -1) {
          let tempunitList = updateArray(
            (deviceList[deviceIndex]?.units as Array<ArrayProps>) || [],
            data
          );
          let list = deviceList;

          list[deviceIndex].units = tempunitList;
          // Set the updated deviceList
          setDeviceList([...list]);
        }
        setErrors({});
        setEditMode(false);
        setDeleteUnitImage(false);
        setSelectedUnitImage({});
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

  const handleDeleteUnitImage = async (
    unitId: number,
    deviceId: number,
    imageId: number
  ) => {
    setDeleteUnitImage(true);
    setSelectedUnitImage({
      unitId,
      deviceId,
      imageId,
    });
    // deleteUnitImage(unitId, deviceId, imageId);
  };

  const handleDeleteDeviceClick = (device: any, unit: any) => {
    setConfirmation(true);
    setselectedItem({
      device,
      unit,
    });
  };

  const handleDeleteDeviceConfirmationClick = async () => {
    setLoading(true);
    try {
      const deleteDevice = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/device/${selectedItem?.device?.id}`,
        method: 'DELETE',
      };

      if (selectedItem?.unit) {
        deleteDevice.endpoint = `${deleteDevice.endpoint}/unit/${selectedItem?.unit?.id}`;
      }

      const { data, isError } = await apiAction.mutateAsync(deleteDevice);

      if (!isError) {
        if (selectedItem?.unit) {
          const deviceIndex = deviceList.findIndex(
            (device) => device.id == selectedItem?.device?.id
          );

          if (deviceIndex > -1) {
            let tempunitList = deleteArrayItem(
              deviceList[deviceIndex]?.units,
              selectedItem.unit as any
            );

            let list = deviceList;

            list[deviceIndex].units = tempunitList;
            // // Set the updated deviceList
            setDeviceList([...list]);
          }
        } else {
          const tempCustomer = deleteArrayItem(
            deviceList,
            selectedItem?.device as any
          );
          setDeviceList(tempCustomer);
        }
      }
      setConfirmation(false);
      setselectedItem({});
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  // Function to handle click event to load more records
  const handleLoadMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + 10); // Increase the display limit by 10
  };

  const onAddPartner = (device: any) => {
    setSelectedDevice(device);
    setShowPartnerDialog(true);
  };

  const onClosePartnerDialog = () => {
    setShowPartnerDialog(false);
    setSelectedDevice({});
  };

  const handlePartnerSave = async () => {
    const { partner_id } = selectedDevice;
    if (!isRequired(partner_id)) {
      setErrors({ partner_id: `Please select partner` });
      return;
    }
    try {
      setLoading(true);
      const assignPartner = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/device/${selectedDevice?.id}/assign-device`,
        method: 'POST',
        body: {
          partner_id,
        },
      };

      const { data } = await apiAction.mutateAsync(assignPartner);
      if (data) {
        setShowPartnerDialog(false);
        let tempSelectedDevice = selectedDevice;
        tempSelectedDevice['device_assign_partner'] = data;
        let tempDeviceList = updateArray(
          state?.[DEVICELIST],
          tempSelectedDevice
        );
        setData({ [DEVICELIST]: [...tempDeviceList] });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPartnerChangeHandler = (key: string, id: number) => {
    setSelectedDevice((prev) => ({
      ...prev,
      [key]: id,
    }));
    setErrors({});
  };

  const fetchAMcDetail = async (amcId: number) => {
    if (amcInfo?.id !== amcId) {
      try {
        setAMCInfoLoader(true);
        const fetchDeviceList = {
          endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/amc/${amcId}/info`,
          method: 'GET',
        };

        const { data } = await apiAction.mutateAsync(fetchDeviceList);
        setAMCinfo(data);
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setAMCInfoLoader(false);
      }
    }
  };

  const openDialog = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedImage('');
  };

  return (
    <div className='flex h-full flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <div className='grid w-full grid-cols-1 gap-5 rounded-md bg-white p-5  lg:grid-cols-9 lg:gap-10'>
          <div className='lg:col-span-3'>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder='Name (Min 3 character) or Contact no (full) or ID'
            />
          </div>
          <div className='lg:col-span-3'>
            <SelectBox
              options={filterBranch}
              value={selectedBranchId}
              onChange={(newValue) => setSelectedBranchId(newValue)}
            />
          </div>
          <div className='flex gap-5 lg:col-span-3'>
            {(state?.[CUSTOMER]?.is_enterprise == 2 || isPBenterPrise) && (
              <Button
                variant={'secondary'}
                className='!w-full'
                onClick={handleAddDeviceClick}
                icon={<IconAddLine className='h-5 w-5 text-white' />}
              >
                Add Device
              </Button>
            )}
          </div>
        </div>

        <div className='mb-16 flex  w-full  flex-col overflow-hidden'>
          <ScrollArea>
            <div className='grow  overflow-auto'>
              <Accordion
                type='single'
                collapsible
                className='flex flex-col gap-5'
              >
                {filteredDeviceData &&
                  filteredDeviceData
                    ?.slice(0, displayLimit)
                    ?.map((device: any, deviceIndex: number) => {
                      const [statusString, className] = getStatusString(
                        device?.amc_registration?.amc_status
                      );
                      return (
                        <div key={deviceIndex}>
                          <AccordionItem
                            key={deviceIndex}
                            value={`main-item-${deviceIndex}`}
                            className='rounded-md border-none bg-white px-4 no-underline'
                          >
                            <AccordionTrigger className='text-left hover:no-underline'>
                              <div className='grid w-full grid-cols-3 items-center justify-between pr-5 '>
                                <div className='flex items-center gap-5 text-sm font-bold capitalize'>
                                  <span
                                    className={`h-3 w-3 rounded-full`}
                                    style={{ backgroundColor: className }}
                                  ></span>
                                  {`${device?.id} - ${device?.name?.toLowerCase()}`}
                                </div>
                                <div className='capitalize'>
                                  {device?.branch?.name}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className=''>
                              <div className='mb-5 grid w-full grid-cols-12 gap-4'>
                                <div className='col-span-4 grid gap-4'>
                                  <div className='grid grid-cols-2'>
                                    <div className='text-sm font-bold'>
                                      Brand Name
                                    </div>
                                    <span className='uppercase'>
                                      {device?.brand?.name || 'Na'}
                                    </span>
                                  </div>
                                  <div className='grid grid-cols-2'>
                                    <div className='text-sm font-bold'>
                                      Machine Type
                                    </div>
                                    <span className='capitalize'>
                                      {device?.machine_type?.name || 'Na'}
                                    </span>
                                  </div>
                                  {device?.installed_on && (
                                    <div className='grid grid-cols-2'>
                                      <div className='text-sm font-bold'>
                                        Installed On
                                      </div>
                                      <span className=''>
                                        {' '}
                                        {moment(device?.installed_on).format(
                                          'YYYY-MM-DD'
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className='col-span-4 grid gap-4'>
                                  <div className='grid grid-cols-2'>
                                    <div className='text-sm font-bold'>
                                      Mapped
                                    </div>
                                    <span className='capitalize'>
                                      {device.is_mapped == 1 ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                  {isPBenterPrise ? (
                                    <div className='grid grid-cols-2'>
                                      <div className='text-sm font-bold'>
                                        Assign
                                      </div>
                                      <span className=''>
                                        <Button
                                          variant={'blue'}
                                          size={'xs'}
                                          onClick={() => onAddPartner(device)}
                                        >
                                          Partner
                                        </Button>
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                                {state?.[CUSTOMER]?.is_enterprise === 2 && (
                                  <div className='col-span-4 flex justify-end gap-4'>
                                    <Button
                                      className='p-3'
                                      onClick={() =>
                                        handleDeviceEditClick(device)
                                      }
                                    >
                                      <IconPencil className='h-5 w-5' />
                                    </Button>
                                    {isAccess && (
                                      <Button
                                        className='p-3'
                                        variant={'destructive'}
                                        onClick={() =>
                                          handleDeleteDeviceClick(device, null)
                                        }
                                      >
                                        <IconDeleteBinLine className='h-5 w-5' />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Accordion type='single' collapsible>
                                {device?.units &&
                                  device?.units?.map(
                                    (unit: any, unitIndex: number) => (
                                      <AccordionItem
                                        key={unitIndex}
                                        value={`sub-item-${unitIndex}`}
                                        className='border px-4 no-underline'
                                      >
                                        <AccordionTrigger
                                          className='text-left hover:no-underline'
                                          onClick={() => setEditMode(false)}
                                        >
                                          <div className='grid w-full grid-cols-3 items-center'>
                                            <div className='col-span-1'>
                                              <div className='text-sm font-bold'>
                                                {unit?.unit_type?.name}
                                              </div>
                                            </div>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className='mb-5 grid w-full grid-cols-12 items-start gap-6'>
                                            <div className='col-span-12 grid gap-4 xl:col-span-5'>
                                              <EditableField
                                                label='Brand Name'
                                                options={brandList}
                                                selectedValue={
                                                  editMode
                                                    ? selectedUnitData?.brand_id
                                                    : unit?.brand_id
                                                }
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.brand
                                                        ?.name
                                                    : unit?.brand?.name
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'brand_id',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                type='dropdown'
                                                error={errors?.brand_id}
                                              />
                                              <EditableField
                                                label='Unit Type :'
                                                options={unitType}
                                                selectedValue={
                                                  editMode
                                                    ? selectedUnitData?.unit_type_id
                                                    : unit?.unit_type_id
                                                }
                                                value={
                                                  editMode
                                                    ? selectedUnitData
                                                        ?.unit_type?.name
                                                    : unit?.unit_type?.name ||
                                                      ''
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'unit_type_id',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                type='dropdown'
                                                error={errors?.unit_type_id}
                                              />
                                              <EditableField
                                                label='Serial Number :'
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.serial_number
                                                    : unit?.serial_number
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'serial_number',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                useCustomStyle={true}
                                                error={errors?.serial_number}
                                              />
                                              <EditableField
                                                label='Model Number :'
                                                options={machineModelList}
                                                optionKey='id' // Set the key for options
                                                optionValue='model_number' // Set the value for options
                                                selectedValue={
                                                  editMode
                                                    ? selectedUnitData?.machine_model_id ??
                                                      0
                                                    : unit?.machine_model_id ??
                                                      0
                                                }
                                                value={
                                                  editMode
                                                    ? selectedUnitData
                                                        ?.machine_model
                                                        ?.model_number ?? 'NA'
                                                    : unit?.machine_model
                                                        ?.model_number ?? 'NA'
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'machine_model_id',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                type='dropdown'
                                                error={errors?.machine_model_id}
                                              />

                                              <EditableField
                                                label='Machine Variant :'
                                                value={
                                                  device?.machine_variant
                                                    ?.name || ''
                                                }
                                                useCustomStyle={true}
                                              />

                                              <EditableField
                                                label='Compressor Make :'
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.compressor_make
                                                    : unit?.compressor_make
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'compressor_make',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                useCustomStyle={true}
                                                error={errors?.compressor_make}
                                              />
                                              <EditableField
                                                label='Compressor Type :'
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.compressor_type
                                                    : unit?.compressor_type
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'compressor_type',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                useCustomStyle={true}
                                                error={errors?.compressor_type}
                                              />

                                              <EditableField
                                                label='Capacity :'
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.capacity
                                                    : unit?.capacity
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'capacity',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                useCustomStyle={true}
                                                error={errors?.capacity}
                                              />
                                              <EditableField
                                                label='Refrigerant :'
                                                options={
                                                  helperData?.data?.refrigerant
                                                }
                                                selectedValue={
                                                  editMode
                                                    ? selectedUnitData?.refrigerant_id
                                                    : unit?.refrigerant_id
                                                }
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.refrigerant_name
                                                    : unit.refrigerant_name
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'refrigerant_id',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                type='dropdown'
                                                error={errors?.refrigerant_id}
                                              />
                                              <EditableField
                                                label='Equipment :'
                                                options={
                                                  helperData?.data?.equipment
                                                }
                                                selectedValue={
                                                  editMode
                                                    ? selectedUnitData?.equipment_id
                                                    : unit?.equipment_id
                                                }
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.equipment_name
                                                    : unit?.equipment_name
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'equipment_id',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                type='dropdown'
                                                error={errors?.equipment_id}
                                              />

                                              <EditableField
                                                label=' Cooling Coil Type :'
                                                options={
                                                  helperData?.data
                                                    ?.condensor_cooling_coil_type
                                                }
                                                selectedValue={
                                                  editMode
                                                    ? selectedUnitData?.cooling_coil_type_id
                                                    : unit?.cooling_coil_type_id
                                                }
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.cooling_coil_type_name
                                                    : unit?.cooling_coil_type_name
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'cooling_coil_type_id',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                type='dropdown'
                                                error={
                                                  errors?.cooling_coil_type_id
                                                }
                                              />

                                              <EditableField
                                                label='Site requirement :'
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.site_requirement
                                                    : unit?.site_requirement
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'site_requirement',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                useCustomStyle={true}
                                                error={errors?.site_requirement}
                                              />
                                            </div>
                                            <div className='col-span-12 grid gap-4 xl:col-span-5'>
                                              <div className='grid grid-cols-2'>
                                                <div className='text-sm font-bold'>
                                                  Unit Images :
                                                </div>

                                                {editMode ? (
                                                  <InputField
                                                    type='file'
                                                    label=''
                                                    accept='image/jpeg, image/png'
                                                    multiple
                                                    onChange={(e) =>
                                                      handleFileInputChange(
                                                        'unit_image',
                                                        e
                                                      )
                                                    }
                                                    error={
                                                      errors?.unit_image || ''
                                                    }
                                                    className={'w-full'}
                                                  />
                                                ) : null}

                                                <div className='flex gap-4'>
                                                  {unit?.unit_image &&
                                                  unit?.unit_image.length > 0
                                                    ? unit.unit_image.map(
                                                        (
                                                          item: any,
                                                          index: any
                                                        ) => (
                                                          <div
                                                            key={index}
                                                            className='cursor-pointer items-center gap-4'
                                                            onClick={() =>
                                                              editMode
                                                                ? null
                                                                : openDialog(
                                                                    item.image
                                                                  )
                                                            }
                                                          >
                                                            <Image
                                                              src={item.image}
                                                              alt={`Unit Image ${index}`}
                                                              className='h-16 w-16'
                                                              height={60}
                                                              width={60}
                                                            />
                                                            {editMode ? (
                                                              <Button
                                                                className='p-2'
                                                                variant='link'
                                                                size='sm'
                                                                onClick={() =>
                                                                  handleDeleteUnitImage(
                                                                    unit.id,
                                                                    device.id,
                                                                    item.id
                                                                  )
                                                                }
                                                              >
                                                                <IconDeleteBinLine className='h-5 w-5' />
                                                              </Button>
                                                            ) : null}
                                                          </div>
                                                        )
                                                      )
                                                    : null}
                                                </div>
                                              </div>
                                              <EditableField
                                                label='Note :'
                                                type={TEXTAREA}
                                                value={
                                                  editMode
                                                    ? selectedUnitData?.note
                                                    : unit?.note
                                                }
                                                editMode={editMode}
                                                handleSelectChange={(
                                                  newValue: any
                                                ) =>
                                                  handleSelectChange(
                                                    'note',
                                                    deviceIndex,
                                                    unitIndex,
                                                    newValue
                                                  )
                                                }
                                                useCustomStyle={true}
                                                error={errors?.note}
                                              />
                                            </div>
                                            {state?.[CUSTOMER]
                                              ?.is_enterprise === 2 && (
                                              <div className='col-span-12 flex flex-wrap items-end justify-end gap-4 xl:col-span-2'>
                                                {editMode ? (
                                                  <>
                                                    {' '}
                                                    <Button
                                                      className='min-w-[80px] p-3'
                                                      size={'sm'}
                                                      disabled={loading}
                                                      icon={
                                                        loading ? (
                                                          <IconLoading />
                                                        ) : (
                                                          ''
                                                        )
                                                      }
                                                      onClick={() =>
                                                        handleSaveDevicesUnit(
                                                          unit.id,
                                                          device.id
                                                        )
                                                      }
                                                    >
                                                      Save{' '}
                                                    </Button>
                                                    <Button
                                                      className='min-w-[80px] p-3'
                                                      variant={'outline'}
                                                      size={'sm'}
                                                      onClick={() =>
                                                        setEditMode(false)
                                                      }
                                                    >
                                                      Cancel
                                                    </Button>
                                                  </>
                                                ) : (
                                                  <>
                                                    {' '}
                                                    <Button
                                                      className='p-2'
                                                      onClick={() =>
                                                        handleUnitEditClick(
                                                          unit
                                                        )
                                                      }
                                                      size={'sm'}
                                                    >
                                                      <IconPencil className='h-5 w-5' />
                                                    </Button>
                                                    {isAccess && (
                                                      <Button
                                                        className='p-2'
                                                        variant={'destructive'}
                                                        size={'sm'}
                                                        onClick={() =>
                                                          handleDeleteDeviceClick(
                                                            device,
                                                            unit
                                                          )
                                                        }
                                                      >
                                                        <IconDeleteBinLine className='h-5 w-5' />
                                                      </Button>
                                                    )}
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    )
                                  )}
                              </Accordion>
                            </AccordionContent>
                            {device?.amc_registration?.amc_status === 1 ? (
                              <Accordion type='single' collapsible>
                                <AccordionItem
                                  key={device?.amc_registration?.id}
                                  value={`sub-item-${device?.amc_registration?.id}`}
                                  className='mb-4 rounded-md border-none bg-white no-underline'
                                >
                                  {aMCInfoLoader && <Loader />}
                                  <AccordionTrigger
                                    className='bg-pbHeaderBlue px-4 text-left text-white hover:no-underline'
                                    onClick={() =>
                                      fetchAMcDetail(
                                        device?.amc_registration?.id
                                      )
                                    }
                                  >
                                    <div className='grid w-full grid-cols-3 items-center'>
                                      <div className='col-span-1'>
                                        <div className='text-sm font-bold'>
                                          AMC Details
                                        </div>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className='px-4'>
                                    <>
                                      <div className='mb-5 grid w-full grid-cols-8 gap-4'>
                                        <div className='col-span-4 grid gap-4'>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Amc Plan :
                                            </div>
                                            <span className='uppercase'>
                                              {amcInfo?.amc_plan?.amc_code}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Nos of Days :
                                            </div>
                                            <span className='capitalize'>
                                              {amcInfo?.amc_plan?.no_of_days}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Amount :
                                            </div>
                                            <span className=''>
                                              {amcInfo?.amount}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Final Amount :
                                            </div>
                                            <span className=''>
                                              {+amcInfo?.amount -
                                                +amcInfo?.discount}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Start Date :
                                            </div>
                                            <span className=''>
                                              {amcInfo?.start_date}
                                            </span>
                                          </div>
                                        </div>
                                        <div className='col-span-4 grid gap-4'>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Amc Description :
                                            </div>
                                            <span className='capitalize'>
                                              {
                                                amcInfo?.amc_plan
                                                  ?.amc_description
                                              }
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Services in Year :
                                            </div>
                                            <span className='capitalize'>
                                              {
                                                amcInfo?.amc_plan
                                                  ?.services_in_year
                                              }
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Discount :
                                            </div>
                                            <span className='capitalize'>
                                              {amcInfo?.discount}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              Status :
                                            </div>
                                            <span className='capitalize'>
                                              {amcInfo?.is_active == 1
                                                ? 'Active'
                                                : 'Expired'}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-2'>
                                            <div className='text-sm font-bold'>
                                              End Date :
                                            </div>
                                            <span className='capitalize'>
                                              {amcInfo?.end_date}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className='mb-5 grid w-full grid-cols-8 gap-4'>
                                        <div className='col-span-4 grid gap-4'>
                                          <div className='grid grid-cols-2'>
                                            <div className=' text-sm font-bold'>
                                              Service Dates :
                                            </div>
                                            <ul className='grid grid-cols-2 gap-4'>
                                              {amcInfo?.amc_service?.map(
                                                (serviceInfo: any) => (
                                                  <li key={serviceInfo?.id}>
                                                    <span>
                                                      {moment(
                                                        serviceInfo?.service_date
                                                      ).format('yyyy-MM-DD')}
                                                    </span>
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ) : null}
                          </AccordionItem>
                        </div>
                      );
                    })}
              </Accordion>
            </div>
            {filteredDeviceData?.length > displayLimit && (
              <div className='my-5 flex flex-col'>
                <Button onClick={handleLoadMore}>Load More</Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {showModal && (
          <AddDevice
            open={!!showModal}
            selectedCustomerID={id}
            selectedData={selectedItem}
            branchList={branchList}
            brandList={brandList}
            machineTypeList={machineTypeList}
            variantList={variantList}
            machineModelList={machineModelList}
            helperData={helperData}
            onSave={handleSave}
            apiBaseUrl={apiBaseUrl}
            onClose={() => setshowModal(false)} // Set onClose to a function that sets selectedRow to null
            onBrandChange={onBrandChange}
          />
        )}

        <ConfirmationDialog
          isOpen={isConfirmation}
          onClose={() => {
            setConfirmation(false);
            setselectedItem({});
          }}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: handleDeleteDeviceConfirmationClick,
              btnLoading: loading,
              icon: loading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          Do You Really Want to Delete This Record
        </ConfirmationDialog>

        <ConfirmationDialog
          isOpen={isDeleteUnitImage}
          onClose={() => {
            setDeleteUnitImage(false);
          }}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: deleteUnitImage,
              btnLoading: loading,
              icon: loading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          Are you sure you want to delete this unit image?
        </ConfirmationDialog>

        <MyDialog
          open={showPartnerDialog}
          onClose={onClosePartnerDialog}
          title='Add / Edit Partner'
          buttons={[
            {
              text: 'Save',
              variant: 'blue',
              size: 'sm',
              onClick: handlePartnerSave,
              btnLoading: loading,
              icon: loading ? <IconLoading /> : '',
            },
          ]}
        >
          <div className='flex h-[85%] grow  flex-col p-5'>
            <SelectBox
              options={partnerList}
              value={selectedDevice?.device_assign_partner?.partner_id}
              onChange={(e) => onPartnerChangeHandler('partner_id', e)}
              error={errors?.partner_id}
            />
          </div>
        </MyDialog>

        <ZoomImageModal
          isOpen={isDialogOpen}
          onRequestClose={closeDialog}
          imageSrc={selectedImage}
        />
      </div>
    </div>
  );
};

export default UnitDetails;
