import { useMutation } from 'react-query';
import { useState, useEffect } from 'react';
import { apiCall } from '@/hooks/api';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { usePathname } from 'next/navigation';
import ROUTES, { getBaseUrl } from '@/utils/utils';

interface FormData {
  [key: string]: any;
}

const useServiceReportData = (apiBaseUrl: any) => {
  const apiAction = useMutation(apiCall);
  const [actionCheckList, setActionCheckList] = useState<
    FormData | undefined
  >();
  const [serviceActionList, setServiceActionList] = useState<
    FormData | undefined
  >();
  const [sparePartsList, setSparePartsList] = useState<FormData | undefined>();

  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isEnterprise = basePath == ROUTES.ENTERPRISE;

  const fetchActionCheckList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.ACTIONCHECKLIST}?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchRequest);
      setActionCheckList(data || []);
    } catch (error) {
      console.error('Failed to fetch Action Check List:', error);
      setActionCheckList([]);
    }
  };

  const fetchServiceActionList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.SERVICEACTION}?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchRequest);
      setServiceActionList(data || []);
    } catch (error) {
      console.error('Failed to fetch Service Action List:', error);
      setServiceActionList([]);
    }
  };

  const fetchSparePartsList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.SPAREPARTS}?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchRequest);
      setSparePartsList(data || []);
    } catch (error) {
      console.error('Failed to fetch Spare Parts List:', error);
      setSparePartsList([]);
    }
  };

  useEffect(() => {
    if (!isEnterprise) {
      fetchActionCheckList();
      fetchServiceActionList();
      fetchSparePartsList();
    }
  }, []);

  return {
    actionCheckList,
    serviceActionList,
    sparePartsList,
  };
};

export default useServiceReportData;
