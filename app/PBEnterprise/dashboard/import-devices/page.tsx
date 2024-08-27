'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import ImportInfo from '@/components/ImportInfo';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { ADMIN } from '@/utils/apiConfig';
import TableComponent from '@/components/Table';
import moment from 'moment';

interface ImportColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const columns: ImportColumneProps[] = [
  {
    accessorKey: 'created_at',
    header: 'Imported at',
    render: (item: any) => (
      <span>{moment(item?.created_at).format('yyyy-MM-DD hh:mma')}</span>
    ),
  },
  { accessorKey: 'rows_count', header: 'Number of records' },
  { accessorKey: 'body', header: 'File name' },
  { accessorKey: 'status', header: 'Status', className: 'capitalize' },

  {
    accessorKey: 'updated_at',
    header: 'Completed date',
    render: (item: any) => (
      <span>{moment(item?.updated_at).format('yyyy-MM-DD hh:mma')}</span>
    ),
  },
];

const ImportDevices = () => {
  const [deviceList, setDeviceList] = useState<any>();
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchDeviceList();
  }, []);

  const fetchDeviceList = async () => {
    try {
      const fetchDevices = {
        endpoint: `${ADMIN}queue-list?queue_type=3&need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchDevices);
      if (data) {
        setDeviceList(data);
      } else setDeviceList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
    }
  };
  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />
        <ImportInfo type='devices' callback={fetchDeviceList} />
        <div className='pt-4'>
          <TableComponent columns={columns} data={deviceList} />
        </div>
      </div>
    </div>
  );
};

export default ImportDevices;
