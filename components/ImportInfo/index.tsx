import React, { FC, useEffect, useRef, useState } from 'react';
import InputField from '../InputField';
import { Button } from '../ui/button';
import { IIcon201Upload3, Icon200Download3, IconLoading } from '@/utils/Icons';
import { apiCall, downloadFile } from '@/hooks/api';
import { useMutation } from 'react-query';
import { ERROR_MESSAGES } from '@/utils/ValidationUtils';
import {
  ADMIN,
  API_BASE_URL,
  API_ENDPOINTS,
  API_ENDPOINTS_ENTERPRISE,
  API_ENDPOINTS_PARTNER,
  PARTNER_,
} from '@/utils/apiConfig';
import ROUTES, { IMPORTTEMPLATE, getBaseUrl } from '@/utils/utils';
import SelectAsync from '../SelectAsync';
import { debounce } from 'lodash';
import { usePathname } from 'next/navigation';

interface FormData {
  [Key: string]: any;
}

interface ImportInfoPros {
  type: 'customers' | 'technicians' | 'devices';
  callback?: () => void;
}

const ImportInfo: FC<ImportInfoPros> = ({ type, callback }) => {
  const [file, setFile] = useState<File | null>();
  const [errors, setErrors] = useState<FormData>({});
  const [isLoading, setLoading] = useState(false);
  const [isSampleLoading, setSampleLoading] = useState(false);
  const [customerList, setCustomerList] = useState<FormData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<FormData>({});
  const [inputKey, setInputKey] = useState(1);
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;

  const fetchCustomer = async (
    customer: any,
    callback: (options: FormData[]) => void
  ) => {
    try {
      const fetchCustomers = {
        endpoint: `${
          isPBEnterprise
            ? API_ENDPOINTS_ENTERPRISE?.CUSTOMERS
            : API_ENDPOINTS_PARTNER?.CUSTOMERS
        }?need_all=1&search=${customer}&without_enterprise=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchCustomers);
      if (data) {
        setCustomerList(data);
        callback(data);
      } else setCustomerList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
    }
  };

  const handleInputChange = (e: any) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setFile(files[0]);
      setErrors({ file: '' });
    }
  };

  const onUpload = () => {
    if (selectedCustomer?.customer_id == undefined) {
      setErrors((prev) => ({
        ...prev,
        customer_id: `Please select a Customer`,
      }));
    }
    if (file?.name != undefined) {
      uploadFile();
    } else {
      setErrors((prev) => ({
        ...prev,
        file: `File ${ERROR_MESSAGES.required}`,
      }));
    }
  };

  const onDownloadSample = async () => {
    setSampleLoading(true);
    const baseUrl = isPBEnterprise ? ADMIN : PARTNER_;
    let endpoint: string = `${baseUrl}export-samples?export_type=1`;
    switch (type) {
      case 'customers': {
        endpoint = `${baseUrl}export-samples?export_type=1`;
        break;
      }
      case 'technicians': {
        endpoint = `${baseUrl}export-samples?export_type=2`;
        break;
      }
      case 'devices': {
        endpoint = `${baseUrl}export-samples?export_type=3`;
        break;
      }
    }
    try {
      const blob: Blob = await downloadFile(endpoint);
      const blobUrl: string = window.URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = `${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download service report:', error);
      // Handle error gracefully (e.g., display a message to the user)
    } finally {
      setSampleLoading(false);
    }
  };

  const uploadFile = async () => {
    setLoading(true);
    let url = API_ENDPOINTS_PARTNER.IMPORT_CUSTOMERS;
    switch (type) {
      case 'customers': {   
        url = isPBEnterprise ? API_ENDPOINTS.IMPORT_CUSTOMERS : API_ENDPOINTS_PARTNER.IMPORT_CUSTOMERS;
        break;
      }
      case 'technicians': {
        url = API_ENDPOINTS_PARTNER.IMPORT_TECHNICIANS;
        break;
      }
      case 'devices': {
        url = isPBEnterprise ? API_ENDPOINTS.IMPORT_DEVICES : API_ENDPOINTS_PARTNER.IMPORT_DEVICES
        url =  url.replace(
          '{id}',
          selectedCustomer?.customer_id
        );
        break;
      }
    }

    const formData = new FormData();
    formData.append('file', file!);

    const request = {
      endpoint: url,
      method: 'POST',
      body: formData,
      isFormData: true,
    };
    try {
      const { isError } = await apiAction.mutateAsync(request);
      if (!isError) {
        setFile(null);
        setInputKey((prev) => prev + 1);
        callback?.();
      }
    } catch (e) {
      console.log('===> error', e?.toString());
    } finally {
      setLoading(false);
    }
  };

  const debounce = (func: Function, delay: number) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const debouncedFetchCustomer = debounce(
    (inputValue: string, callback: (options: FormData[]) => void) => {
      fetchCustomer(inputValue, callback);
    },
    500
  );

  const handleDropdownInputChange = (
    inputValue: string,
    callback: (options: FormData[]) => void
  ) => {
    if (inputValue.length >= 3) {
      debouncedFetchCustomer(inputValue, callback);
    } else {
      callback(customerList);
    }
  };

  return (
    <div className='flex items-center justify-center space-x-4'>
      {type == 'devices' ? (
        <div className=' flex flex-col'>
          <SelectAsync
            // loadOptions={promiseOptions}
            // value={customerList}
            key={inputKey}
            loadOptions={handleDropdownInputChange}
            getOptionLabel={(x: any) => `PBUCS-${x?.id} ${x.name}`}
            onChange={(customer: FormData) => {
              setSelectedCustomer({ customer_id: customer?.id });
              setErrors((pre) => ({ ...pre, customer_id: '' }));
            }}
            error={errors?.customer_id}
          />
        </div>
      ) : null}
      <InputField
        type='file'
        key={inputKey}
        onChange={handleInputChange}
        error={errors?.file || ''}
      />

      <Button
        size='xs'
        icon={isLoading ? <IconLoading /> : <IIcon201Upload3 />}
        disabled={isLoading || isSampleLoading}
        onClick={onUpload}
      >
        Upload
      </Button>
      <Button
        size='xs'
        icon={isSampleLoading ? <IconLoading /> : <Icon200Download3 />}
        disabled={isLoading || isSampleLoading}
        // className='opacity-60'
        onClick={onDownloadSample}
      >
        Download Sample
      </Button>
    </div>
  );
};

export default ImportInfo;
