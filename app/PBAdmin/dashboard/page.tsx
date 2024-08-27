'use client';
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';
import Dashboard from '@/components/Customers/Dashboard';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import TableComponent from '@/components/Table';
import CheckboxItem from '@/components/CheckboxItem';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { IconLoading } from '@/utils/Icons';
import moment from 'moment';
import { deleteArrayItem, updateArray } from '@/utils/utils';
import Loader from '@/components/Loader';
import Breadcrumb from '@/components/Breadcrumb';

interface TechnicianColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const Page = () => {
  const [technicians, setTechnicians] = useState<any>();
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteLoading, setDelteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchTechnicianList();
  }, []);

  const fetchTechnicianList = async () => {
    try {
      const data = {
        endpoint: `${API_ENDPOINTS.TECHNICIAN_REGISTER}?need_all=1`,
        method: 'GET',
      };
      const response = await apiAction.mutateAsync(data);
      if (response?.data) {
        setTechnicians(response?.data);
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setTechnicians([]);
    }
  };

  const onContacted = async (checked: boolean, item: any) => {
    try {
      const data = {
        endpoint: `${API_ENDPOINTS.TECHNICIAN_REGISTER}/${item?.id}`,
        method: 'POST',
        body: {
          is_contacted: checked ? 1 : 2,
        },
      };
      setUpdateLoading(true);
      const response = await apiAction.mutateAsync(data);
      if (response?.data) {
        item.is_contacted = checked ? 1 : 2;
        setTechnicians([...updateArray(technicians, item)]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const data = {
        endpoint: `${API_ENDPOINTS.TECHNICIAN_REGISTER}/${selectedItem?.id}`,
        method: 'DELETE',
      };
      setDelteLoading(true);
      const response = await apiAction.mutateAsync(data);
      if (response?.data) {
        setSelectedItem(null);
        setConfirmationDialogOpen(false);
        setTechnicians(deleteArrayItem(technicians, selectedItem));
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setDelteLoading(false);
    }
  };

  const onDeleteCLick = (item: any) => {
    setConfirmationDialogOpen(true);
    setSelectedItem(item);
  };

  const columns: TechnicianColumn[] = [
    {
      accessorKey: 'sr_no',
      header: 'Sr No.',
      render: (item: any, index: number) => <span>{index + 1}</span>,
    },
    { accessorKey: 'phone', header: 'Phone No.' },
    {
      accessorKey: 'created_at',
      header: 'Date',
      render: (item: any) => (
        <span>{moment(item?.created_at).format('yyyy-MM-DD HH:mm')}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => (
        <div className='flex gap-4'>
          <CheckboxItem
            key={item.id}
            checked={item?.is_contacted == 1} // Check if the current brand id is in the selectedSkillids array
            onCheckedChange={(checked) => onContacted(checked, item)}
            ariaLabel={'Contacted'}
            id={`${item.id}`}
          />

          <Button
            size={'xs'}
            variant={'destructive'}
            onClick={() => onDeleteCLick(item)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    // <> <Dashboard apiBaseUrl={API_ENDPOINTS} isDashboard={true} /> </>
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />
        <div className='text-lg font-bold'>Unmapped Technician</div>
        <TableComponent columns={columns} data={technicians} />
      </div>
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => {
          setConfirmationDialogOpen(false);
          setSelectedItem(null);
        }}
        buttons={[
          {
            text: 'Yes',
            variant: 'destructive',
            size: 'sm',
            onClick: handleDelete,
            btnLoading: deleteLoading,
            icon: deleteLoading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        Do You Really Want to Delete This Record?
      </ConfirmationDialog>
      {updateLoading ? <Loader /> : null}
    </div>
  );
};

export default Page;
