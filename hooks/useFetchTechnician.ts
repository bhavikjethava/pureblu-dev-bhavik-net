// src/hooks/useFetchTechnician.ts

import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ROUTES, { REFRESH_TECHNICIANLIST, getBaseUrl } from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';
import { usePathname } from 'next/navigation';
import { API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';

const useFetchTechnician = (apiBaseUrl: any, partnerId?: any, is_active?: boolean) => {
  const [technicianList, setTechnicianList] = useState<any>([]);
  const [activeTechnician, setActiveTechnician] = useState(null);
  const apiAction = useMutation(apiCall);
  const { state, setData } = useContext(DataContext);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;

  const fetchTechnician = async () => {
    try {
      let endpoint = `${apiBaseUrl.TECHNICIAN}`;
      if (is_active) {
        endpoint += `?is_active=1`;
      }
      const getdata = {
        endpoint,
        method: 'GET',
      };
      setTechnicianList(undefined);

      const { data } = await apiAction.mutateAsync(getdata);
      setActiveTechnician(data.active_technician);
      setTechnicianList(data.technician.data);
    } catch (error) {
      console.error('Failed to fetch technician:', error);
    }
  };

  const fetchTechnicianByPartner = async (partnerId: string) => {
    try {
      let endpoint = `${API_ENDPOINTS_ENTERPRISE.TECHNICIAN_BY_PARTNER}?partner_id=${partnerId}&need_all=1`;

      const getdata = {
        endpoint: endpoint,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(getdata);
      setActiveTechnician(data.active_technician);
      setTechnicianList(data.technician);
    } catch (error) {
      console.error('Failed to fetch technician by partner:', error);
    }
  };

  const updateTechnicianList = (updatedList: any) => {
    setTechnicianList(updatedList);
  };

  useEffect(() => {
    !isEnterprise && !isPBEnterprise && fetchTechnician();
  }, [state?.[REFRESH_TECHNICIANLIST]]);

  useEffect(() => {
    isPBEnterprise && partnerId && fetchTechnicianByPartner(partnerId);
  }, [partnerId]);

  return { technicianList, activeTechnician, updateTechnicianList };
};

export default useFetchTechnician;
