// apiUtils.ts

import { showToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient, isError } from 'react-query';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, API_ENDPOINTS } from '@/utils/apiConfig';
import { usePathname } from 'next/navigation';
import { handleLogin, handleLogout } from '@/app/actions';
// import { getClientCookie, setClientCookie } from '@/utils/cookieUtils';
import { IconBxErrorCircle, IconCircleCheck } from '@/utils/Icons';
import ROUTES, {
  AUTH,
  HelperData,
  OptionType,
  STATE,
  getAuthKeyFromPath,
  getBaseUrl,
} from '@/utils/utils';
import { useState } from 'react';

export const apiCall = async ({
  endpoint,
  method = 'GET',
  headers = {},
  body = {},
  isFormData,
}: {
  endpoint: string;
  method?: string;
  headers?: { [key: string]: string };
  body?: any;
  isFormData?: boolean;
}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  let type = AUTH.PBADMIN;
  if (window) {
    type = getAuthKeyFromPath(window.location.pathname);
  }
  // const token = await getClientCookie(type);
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${localStorage.getItem(`${type}_authToken`)}`,
      ...headers,
    },
    body: method !== 'GET' ? (isFormData ? body : JSON.stringify(body)) : null,
  });
  const reposeBody = await response.json();

  if (!response.ok) {
    // throw new Error(errorData.message || 'Network response was not ok');
    let isError =
      reposeBody?.errors && Object.values(reposeBody?.errors).length > 0;
    if (response.status !== 200) {
      isError = true;
    }
    if (response.status === 401) {
      // unauthorized
      if (window) {
        const basePath = getBaseUrl(window.location.pathname);
        await handleLogout(basePath);
        window.location.replace(`/${basePath}/login`);
      }
    }
    showToast({
      variant: 'destructive',
      message:
        reposeBody?.errors?.length > 0
          ? reposeBody?.errors?.[0]
          : reposeBody.message,
      icon: <IconBxErrorCircle className='h-6 w-6' />,
    });
    return { errors: reposeBody?.errors, isError };
  }

  if (method !== 'GET') {
    showToast({
      variant: 'success',
      message: reposeBody.message,
      icon: <IconCircleCheck className='h-6 w-6' />,
    });
  }

  return reposeBody;
};

export const useApiResource = (queryKey: string, endpoint: string) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, isError } = useQuery(
    queryKey,
    () => apiCall({ endpoint }),
    {
      enabled: false,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    }
  );

  const apiAction = useMutation(apiCall);

  const loginUser = useMutation(apiCall, {
    onSuccess: async (data: any) => {
      const basePath = getBaseUrl(pathname);
      const type = getAuthKeyFromPath(pathname);
      // Assuming the API response contains an authToken
      if (data?.data?.token_info && data?.data?.token_info?.access_token) {
        localStorage.setItem(`${type}_user_info`, JSON.stringify(data.data));
        localStorage.setItem(
          `${type}_authToken`,
          data.data.token_info.access_token
        );
        // setClientCookie('authToken', data.data.token_info.access_token);
        await handleLogin(type, data.data.token_info.access_token);
      }

      const dynamicURL = `/${basePath}/dashboard`;
      router.push(dynamicURL);
    },
    onError: (error: any) => {
      showToast({
        variant: 'destructive',
        message: error.message || 'Error occurred',
      });
    },
  });

  return {
    data,
    isLoading,
    isError,
    apiAction,
    loginUser,
    getOtp: apiAction,
  };
};

export const useStateCity = () => {
  const [stateList, setState] = useState<Array<OptionType>>([]);
  const [cityList, setCity] = useState<Array<OptionType>>([]);
  const apiAction = useMutation(apiCall);

  const fetchRequest = async (type: string, id: number) => {
    try {
      const helperState = {
        endpoint: `${API_ENDPOINTS.HELPER_API}/${id}/${
          type == STATE ? 'state' : 'city'
        }`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(helperState);

      if (type == STATE) {
        setState(data);
        // setCity([]);
      } else {
        setCity(data);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const setStateList = (state: Array<OptionType>) => {
    setState(state);
  };

  const setCityList = (city: Array<OptionType>) => {
    setCity(city);
  };

  return { stateList, cityList, setStateList, setCityList, fetchRequest };
};

export const downloadFile = async (
  endpoint: string,
  fileType?: string | null,
  isAuthoriz?: boolean
): Promise<Blob> => {
  const url = `${API_BASE_URL}${endpoint}`;
  let type = AUTH.PBADMIN;
  if (typeof window !== 'undefined') {
    type = getAuthKeyFromPath(window.location.pathname);
  }

  const authToken = localStorage.getItem(`${type}_authToken`);

  const headers: any = {
    Accept: 'application/pdf',
    'Content-Type': fileType ? fileType : 'application/pdf',

    // Add any other required headers here
  };
  if (!isAuthoriz) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  if (!authToken && !isAuthoriz) {
    throw new Error('Authentication token not found');
  }

  const response: any = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const reposeBody = await response.json();
    showToast({
      variant: 'destructive',
      message:
        reposeBody?.errors?.length > 0
          ? reposeBody?.errors?.[0]
          : reposeBody.message,
      icon: <IconBxErrorCircle className='h-6 w-6' />,
    });
    throw new Error(
      reposeBody?.message ? reposeBody?.message : 'Failed to fetch PDF file'
    );
  }

  return await response.blob();
};
