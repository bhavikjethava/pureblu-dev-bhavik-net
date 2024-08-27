// useApiResource.ts

import { showToast } from '@/components/Toast';
import { API_BASE_URL, API_ENDPOINTS } from '@/utils/apiConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  getAuthKeyFromPath,
  getAuthTypeFromUrl,
  getBaseUrl,
} from '@/utils/utils';

interface ResourceData {
  [key: string]: string;
}

interface ApiData {
  [key: string]: string;
}

interface LoginData {
  phone: string;
  auth_type: string;
  otp?: string;
  request_secrete?: string;
}

const sendOtp = async ({ phone, auth_type }: LoginData): Promise<ApiData> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_PHONE}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, auth_type }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Verify failed');
  }

  return response.json();
};

const loginUser = async ({
  otp,
  request_secrete,
  phone,
}: LoginData): Promise<ApiData> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otp, request_secrete, phone }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Verify failed');
  }

  return response.json();
};

const fetchResourceData = async (url: string): Promise<ResourceData[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Network response was not ok');
  }
  return response.json();
};

export const useApiResource = (resourceUrl: string, resourceKey: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Query for fetching resource data
  const {
    data: resourceData,
    isLoading: isLoadingResource,
    isError: isErrorResource,
    refetch,
  } = useQuery<ResourceData[], Error>(
    resourceKey,
    () => fetchResourceData(resourceUrl),
    { enabled: false }
  );

  // Mutation for adding/updating a resource
  const addOrUpdateResource = useMutation(
    async (data: ApiData) => {
      const response = await fetch(
        `${resourceUrl}${data.id ? `/${data.id}` : ''}`,
        {
          method: data.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
    {
      onSuccess: () => {
        // After a successful mutation, refetch the data to update the UI
        queryClient.invalidateQueries(resourceKey);
      },
    }
  );

  const getloginUser = useMutation(loginUser, {
    onSuccess: async (data: any) => {
      showToast({
        variant: 'success',
        message: data.message,
      });
      const basePath = getBaseUrl(pathname);
      const type = getAuthKeyFromPath(pathname);
      if (data.data && data.data.token_info.access_token) {
        // localStorage.setItem('authToken', data.data.token_info.access_token);
        localStorage.setItem(`${type}_user_info`, data);
      }

      const dynamicURL = `/${basePath}/dashboard`;
      await router.push(dynamicURL);
    },
    onError: (error: any) => {
      showToast({
        variant: 'destructive',
        message: error.message,
      });
    },
  });

  return {
    resourceData,
    isLoadingResource,
    isErrorResource,
    refetchResource: refetch,
    addOrUpdateResource,
    getOtp: sendOtp,
    loginUser: getloginUser,
  };
};
