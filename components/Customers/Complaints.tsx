import React, { useContext, useEffect, useState } from 'react';
import InputField from '../InputField';
import CheckboxItem from '../CheckboxItem';
import SelectBox from '../SelectBox';
import Link from 'next/link';
import ROUTES, {
  BRANCHLIST,
  DEVICELIST,
  OptionType,
  SKILLLIST,
  getBaseUrl,
} from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ComplaintsList from './ComplaintsList';
import { Button } from '../ui/button';
import { IconClipboard, IconExternalLink } from '@/utils/Icons';
import { usePathname } from 'next/navigation';

const Complaints = ({ apiBaseUrl }: any) => {
  const [filter, setFilter] = useState({
    search: '',
    branch_id: -1,
    device_id: -1,
  });
  const [branchList, setBranchList] = useState<Array<OptionType>>([]);
  const [deviceList, setDeviceList] = useState<Array<OptionType>>([]);
  const [technicianList, setTechnicianList] = useState<FormData | undefined>();
  const { state, setData } = useContext(DataContext);
  const apiAction = useMutation(apiCall);

  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isEnterprise = basePath == ROUTES.ENTERPRISE;

  useEffect(() => {
    let tempBranchList: Array<OptionType> = [];
    if (state?.[BRANCHLIST]) tempBranchList = [...state?.[BRANCHLIST]];
    tempBranchList.unshift({ id: -1, name: 'All Branches' });
    setBranchList(tempBranchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[BRANCHLIST]]);

  useEffect(() => {
    let tempDeiceList: Array<OptionType> = [];
    if (state?.[DEVICELIST]) tempDeiceList = [...state?.[DEVICELIST]];
    tempDeiceList.unshift({ id: -1, name: 'All Devices' });
    setDeviceList(tempDeiceList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[DEVICELIST]]);

  useEffect(() => {
    {
      !isEnterprise && fetchSkillList();
    }
  }, []);

  const fetchSkillList = async () => {
    try {
      const fetchSkillRequest = {
        endpoint: `${apiBaseUrl.SKILL}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchSkillRequest);
      setData({ [SKILLLIST]: data });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onChangeHandler = (field: string, value: string) => {
    setFilter((pre) => ({
      ...pre,
      [field]: value,
    }));
  };

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <ComplaintsList apiBaseUrl={apiBaseUrl} />
      </div>
    </div>
  );
};

export default Complaints;
