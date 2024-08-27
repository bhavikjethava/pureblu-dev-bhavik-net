'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import ImportInfo from '@/components/ImportInfo';
import TableComponent from '@/components/Table';
import { PARTNER_ } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import moment from 'moment';
import { notFound } from 'next/navigation';
import { useAccessRights } from '@/hooks/useAccessRights';

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

const ImportTechnicians = () => {
  const [technicianList, setTechnicianList] = useState<any>();
  const apiAction = useMutation(apiCall);
  const { isAccess } = useAccessRights();

  if (!isAccess) {
    notFound();
  }

  useEffect(() => {
    fetchTechnicianList();
  }, []);

  const fetchTechnicianList = async () => {
    try {
      const fetchTechnicians = {
        endpoint: `${PARTNER_}queue-list?queue_type=2&need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchTechnicians);
      if (data) {
        setTechnicianList(data);
      } else setTechnicianList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
    }
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />
        <ImportInfo type='technicians' callback={fetchTechnicianList} />

        <TableComponent columns={columns} data={technicianList} />
      </div>
    </div>
  );
};

export default ImportTechnicians;
