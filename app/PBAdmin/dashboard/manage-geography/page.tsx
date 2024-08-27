'use client';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import InputField from '@/components/InputField';
import MyDialog from '@/components/MyDialog';
import SelectBox from '@/components/SelectBox';
import TableComponent from '@/components/Table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiCall } from '@/hooks/api';
import { IconAddLine, IconEdit, IconLoading } from '@/utils/Icons';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { ArrayProps, getActiveDeactiveMsg } from '@/utils/utils';
import { isError } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

interface ColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const type = {
  COUNTRY: 'Country',
  STATE: 'State',
  CITY: 'City',
};

const MangeGeoGraphy = () => {
  const [countryList, setCountryList] = useState<ArrayProps[]>();
  const [countyDropdown, setCountryDropdown] = useState<ArrayProps[]>([]);
  const [stateList, setStateList] = useState<ArrayProps[]>();
  const [stateDropdown, setStateDropdown] = useState<ArrayProps[]>([]);
  const [stateFilterList, setFilterStateList] = useState<ArrayProps[]>([]);
  const [cityList, setCityList] = useState<ArrayProps[]>();
  const [cityFilterList, setFilterCityList] = useState<ArrayProps[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState<any>({
    show: false,
    type: '',
    action: '',
    item: null,
  });
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchCountry();
    fetchState();
    fetchCity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ((countryList?.length || 0) > 0) {
      setCountryDropdown(countryList!.filter((x: any) => x.is_active == 1));
    }
  }, [countryList]);

  useEffect(() => {
    if ((stateList?.length || 0) > 0 && formData?.mainSelectedCountryId) {
      setStateDropdown(
        stateList!.filter(
          (x: any) =>
            x.is_active == 1 && x.country_id == formData?.mainSelectedCountryId
        )
      );
      setFilterStateList(
        stateList!.filter(
          (x: any) => x.country_id == formData?.mainSelectedCountryId
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateList, formData?.mainSelectedCountryId]);

  useEffect(() => {
    if ((cityList?.length || 0) > 0 && formData?.mainSelectedStateId) {
      setFilterCityList(
        cityList!.filter(
          (x: any) => x.state_id === formData?.mainSelectedStateId
        )
      );
    }
  }, [cityList, formData?.mainSelectedStateId]);

  const fetchCountry = async () => {
    try {
      let fetchCountry = {
        endpoint: `${API_ENDPOINTS.COUTRY}`,
        method: 'GET',
      };
      const { data, isError, errors } =
        await apiAction.mutateAsync(fetchCountry);
      if (data) {
        setCountryList(data);
      } else {
        setCountryList([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchState = async () => {
    try {
      let fetchState = {
        endpoint: `${API_ENDPOINTS.STATE}`,
        method: 'GET',
      };
      const { data, isError, errors } = await apiAction.mutateAsync(fetchState);
      if (data) {
        setStateList([...data]);
      } else {
        setStateList([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchCity = async () => {
    try {
      let fetchCity = {
        endpoint: `${API_ENDPOINTS.CITY}`,
        method: 'GET',
      };
      const { data, isError, errors } = await apiAction.mutateAsync(fetchCity);
      if (data) {
        setCityList(data);
      } else {
        setCityList([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onChange = (field: string, value: ArrayProps) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev: any) => ({
      ...prev,
      [field]: '',
    }));
  };

  const onClose = () => {
    setModalInfo({ show: false, type: '', action: '', item: null });
    setErrors({});
    setFormData((prev: any) => ({
      mainSelectedCountryId: prev?.mainSelectedCountryId,
      mainSelectedStateId: prev?.mainSelectedStateId,
    }));
  };

  const onAddClick = (type: string) => {
    setModalInfo({ show: true, type, action: 'Add', item: null });
  };

  const onActiveDeactiveCLick = (item: any, type: string) => {
    setModalInfo({ showActiveInactiveDailog: true, item, type });
  };

  const onDeleteCLick = (item: any, type: string) => {
    setModalInfo({
      showActiveInactiveDailog: true,
      item,
      type,
      isDelete: true,
    });
  };

  const onEditClick = (item: any, type: string) => {
    setModalInfo({ show: true, type, action: 'Edit', item });
    setFormData((prev: any) => ({
      ...prev,
      ...item,
    }));
  };

  const onSave = async () => {
    let url = API_ENDPOINTS.COUTRY;
    switch (modalInfo.type) {
      case type.COUNTRY: {
        url = `${API_ENDPOINTS.COUTRY}/${modalInfo?.item?.id}`;
        break;
      }
      case type.STATE: {
        url = `${API_ENDPOINTS.STATE}/${modalInfo?.item?.id}`;
        break;
      }
      case type.CITY: {
        url = `${API_ENDPOINTS.CITY}/${modalInfo?.item?.id}`;
        break;
      }
    }
    try {
      setLoading(true);
      let postData = {
        endpoint: url,
        method: modalInfo?.isDelete ? 'DELETE' : 'PATCH',
        ...(!modalInfo?.isDelete && {
          body: {
            is_active: modalInfo?.item?.is_active == 1 ? 2 : 1,
          },
        }),
      };
      const { data, isError, errors } = await apiAction.mutateAsync(postData);
      if (data) {
        switch (modalInfo.type) {
          case type.COUNTRY: {
            fetchCountry();
            break;
          }
          case type.STATE: {
            fetchState();
            break;
          }
          case type.CITY: {
            fetchCity();
            break;
          }
        }
        onClose();
      }
    } catch (e: any) {
      console.log('----> error', e.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    let url = API_ENDPOINTS.COUTRY;
    let err: any = {};
    let isFormError = false;
    switch (modalInfo.type) {
      case type.COUNTRY: {
        url = API_ENDPOINTS.COUTRY;
        const { phone_code, currency } = formData;
        if (!isRequired(phone_code)) {
          err['phone_code'] = `Country Code${ERROR_MESSAGES.required}`;
          isFormError = true;
        }
        if (!isRequired(currency)) {
          err['currency'] = `Currency${ERROR_MESSAGES.required}`;
          isFormError = true;
        }
        break;
      }
      case type.STATE: {
        url = API_ENDPOINTS.STATE;
        const { country_id } = formData;
        if (!isRequired(country_id)) {
          err['country_id'] = `Country name${ERROR_MESSAGES.required}`;
          isFormError = true;
        }
        break;
      }
      case type.CITY: {
        const { state_id } = formData;
        if (!isRequired(state_id)) {
          err['state_id'] = `State name${ERROR_MESSAGES.required}`;
          isFormError = true;
        }
        url = API_ENDPOINTS.CITY;
        break;
      }
    }
    if (!isRequired(formData?.name)) {
      err['name'] = `${modalInfo.type} name${ERROR_MESSAGES.required}`;
      isFormError = true;
    }
    if (isFormError) {
      setErrors(err);
    } else {
      try {
        setLoading(true);
        if (modalInfo?.action === 'Edit') {
          url += `/${modalInfo?.item?.id}`;
        }
        let postData = {
          endpoint: url,
          method: modalInfo?.action === 'Edit' ? 'PATCH' : 'POST',
          body: formData,
        };
        const { data, isError, errors } = await apiAction.mutateAsync(postData);
        if (data) {
          switch (modalInfo.type) {
            case type.COUNTRY: {
              fetchCountry();
              break;
            }
            case type.STATE: {
              fetchState();
              break;
            }
            case type.CITY: {
              fetchCity();
              break;
            }
          }
          onClose();
        } else {
          setErrors(errors);
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const countryColumns: ColumneProps[] = [
    { accessorKey: 'name', header: 'Country Name' },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => renderButton(item, type.COUNTRY),
    },
  ];

  const stateColumns: ColumneProps[] = [
    { accessorKey: 'name', header: 'State Name' },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => renderButton(item, type.STATE),
    },
  ];

  const cityColumns: ColumneProps[] = [
    { accessorKey: 'name', header: 'City Name' },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => renderButton(item, type.CITY),
    },
  ];

  const renderButton = (item: any, type: string) => (
    <div className='flex'>
      <Button
        size={'xs'}
        icon={<IconEdit />}
        onClick={() => onEditClick(item, type)}
      >
        Edit
      </Button>
      <Button
        size={'xs'}
        className='mx-1'
        variant={item.is_active == 1 ? 'secondary' : 'destructive'}
        onClick={() => onActiveDeactiveCLick(item, type)}
      >
        {item.is_active == 2 ? 'Active' : 'Inactive'}
      </Button>
      <Button size={'xs'} onClick={() => onDeleteCLick(item, type)}>
        Delete
      </Button>
    </div>
  );

  const renderCountry = () => (
    <div>
      <Button
        variant={'secondary'}
        size={'sm'}
        icon={<IconAddLine className='h-5 w-5 text-white' />}
        onClick={() => onAddClick(type.COUNTRY)}
      >
        Add New Country
      </Button>
      <div className='min-h-[60px]'></div>
      <div className='mt-5'>
        <TableComponent columns={countryColumns} data={countryList} />
      </div>
    </div>
  );

  const renderState = () => (
    <div>
      <Button
        variant={'secondary'}
        size={'sm'}
        icon={<IconAddLine className='h-5 w-5 text-white' />}
        onClick={() => onAddClick(type.STATE)}
      >
        Add New State
      </Button>
      <div className='pt-5'>
        <SelectBox
          placeholder='Select Country'
          options={countyDropdown}
          onChange={(e) => onChange('mainSelectedCountryId', e)}
        />
      </div>
      <div className='mt-5'>
        <TableComponent columns={stateColumns} data={stateFilterList} />
      </div>
    </div>
  );

  const renderCity = () => (
    <div>
      <Button
        variant={'secondary'}
        size={'sm'}
        icon={<IconAddLine className='h-5 w-5 text-white' />}
        onClick={() => onAddClick(type.CITY)}
      >
        Add New City
      </Button>
      <div className='pt-5'>
        <SelectBox
          placeholder='Select State'
          options={stateDropdown}
          value={null}
          onChange={(e) => onChange('mainSelectedStateId', e)}
        />
      </div>
      <div className='mt-5'>
        <TableComponent columns={cityColumns} data={cityFilterList} />
      </div>
    </div>
  );
  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <ScrollArea className='grow '>
          <div className='grid w-full grid-cols-3 gap-5 pt-5'>
            {renderCountry()}
            {renderState()}
            {renderCity()}
          </div>
        </ScrollArea>
      </div>
      {modalInfo?.show ? (
        <MyDialog
          open={modalInfo.show}
          onClose={onClose}
          title={`${modalInfo.action} ${modalInfo.type}`}
          ClassName='sm:max-w-[40%] grow'
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
          <div className='flex grow flex-col p-4'>
            <div className='grid  gap-5'>
              {/* country add/edit */}
              {modalInfo.type == type.COUNTRY ? (
                <>
                  <InputField
                    type='text'
                    label='Country Name:'
                    value={formData?.name || ''}
                    onChange={(e) => onChange('name', e)}
                    error={errors?.name || ''}
                  />
                  <InputField
                    type='text'
                    label='Country Code:'
                    value={formData?.phone_code || ''}
                    onChange={(e) => onChange('phone_code', e)}
                    error={errors?.phone_code || ''}
                  />
                  <InputField
                    type='text'
                    label='Currency:'
                    value={formData?.currency || ''}
                    onChange={(e) => onChange('currency', e)}
                    error={errors?.currency || ''}
                  />
                </>
              ) : null}
              {/* State add/ edit */}
              {modalInfo.type == type.STATE ? (
                <>
                  <SelectBox
                    label='Country Name:'
                    options={countryList}
                    value={formData?.country_id}
                    onChange={(e) => onChange('country_id', e)}
                    error={errors?.country_id || ''}
                  />
                  <InputField
                    type='text'
                    label='State Name:'
                    value={formData?.name || ''}
                    onChange={(e) => onChange('name', e)}
                    error={errors?.name || ''}
                  />
                </>
              ) : null}
              {/* City add / edit*/}
              {modalInfo.type == type.CITY ? (
                <>
                  <SelectBox
                    label='State Name:'
                    options={stateList}
                    value={formData?.state_id}
                    onChange={(e) => onChange('state_id', e)}
                    error={errors?.state_id || ''}
                  />
                  <InputField
                    type='text'
                    label='City Name:'
                    value={formData?.name || ''}
                    onChange={(e) => onChange('name', e)}
                    error={errors?.name || ''}
                  />
                </>
              ) : null}
            </div>
          </div>
        </MyDialog>
      ) : null}

      {modalInfo?.showActiveInactiveDailog ? (
        <ConfirmationDialog
          isOpen={modalInfo?.showActiveInactiveDailog}
          onClose={onClose}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: onSave,
              btnLoading: isLoading,
              icon: isLoading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          {modalInfo?.isDelete
            ? 'Do You Really Want to Delete This Record?'
            : getActiveDeactiveMsg(modalInfo?.item?.is_active, 'Record')}
        </ConfirmationDialog>
      ) : null}
    </div>
  );
};

export default MangeGeoGraphy;
