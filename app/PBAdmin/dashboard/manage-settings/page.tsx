'use client';
import Breadcrumb from '@/components/Breadcrumb';
import Loader from '@/components/Loader';
import { Switch } from '@/components/ui/switch';
import { apiCall } from '@/hooks/api';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';

const ManageSettings = () => {
  const [formData, setFormData] = useState({
    is_send_sms: false,
    is_send_email: false,
  });
  const [isLoading, setLoading] = useState(false);
  const isInitialRender = useRef(1);
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (field: string, checked: boolean) => {
    setFormData((prev: any) => {
      return {
        ...prev,
        [field]: checked,
      };
    });
    let body = {
      [field]: checked === true ? 1 : 2,
    };
    postSettings(body);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const fetchSettings = {
        endpoint: `${API_ENDPOINTS.GLOBAL_SETTING}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchSettings);
      if (data) {
        setFormData({
          is_send_email: data?.is_send_email === 1,
          is_send_sms: data?.is_send_sms === 1,
        });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const postSettings = async (body: any) => {
    try {
      setLoading(true);
      const postSettingsData = {
        endpoint: `${API_ENDPOINTS.GLOBAL_SETTING}`,
        method: 'POST',
        body,
      };

      const { data } = await apiAction.mutateAsync(postSettingsData);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />
        <div className='mt-5'>
          <div className='my-5 flex items-center justify-center'>
            <label className='mr-5 block font-bold'>SMS</label>
            <Switch
              className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
              checked={formData?.is_send_sms}
              onCheckedChange={(checked) => onChange('is_send_sms', checked)}
              aria-readonly
            />
          </div>
          <div className='my-5 flex items-center justify-center'>
            <label className='mr-5 block text-center font-bold'>Email</label>
            <Switch
              className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
              checked={formData?.is_send_email}
              onCheckedChange={(checked) => onChange('is_send_email', checked)}
              aria-readonly
            />
          </div>
        </div>
      </div>
      {isLoading ? <Loader /> : null}
    </div>
  );
};

export default ManageSettings;
