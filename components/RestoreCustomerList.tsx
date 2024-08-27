import React, { useEffect, useState } from 'react';
import TableComponent from './Table';
import { ArrayProps, deleteArrayItem } from '@/utils/utils';
import { ADMIN, API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ConfirmationDialog from './ConfirmationDialog';
import { IconLoading } from '@/utils/Icons';
import { Button } from './ui/button';

const RestoreCustomerList = () => {
  const [customerList, setCustomerList] = useState<ArrayProps[] | undefined>();
  const [showRestoreCustomerModal, setRestoreCustomerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArrayProps>({});
  const [isLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const apiData = {
        endpoint: `${ADMIN}trashed-customers`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      if (data) {
        setCustomerList(data.data);
      } else {
        setCustomerList([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setCustomerList([]);
    } finally {
    }
  };

  const handleYesClick = async () => {
    try {
      setLoading(true);
      const apiData = {
        endpoint: `${ADMIN}restore-customer?customer_id=${selectedItem?.id}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(apiData);
      if (data) {
        setCustomerList(
          deleteArrayItem(customerList || [], selectedItem as any)
        );
        setRestoreCustomerModal(false);
      } else {
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setCustomerList([]);
    } finally {
      setLoading(false);
    }
  };

  const restoreConfirmation = (item: any) => {
    setSelectedItem(item);
    setRestoreCustomerModal(true);
  };

  const columns = [
    { accessorKey: 'name', header: 'Customer Name' },
    { accessorKey: 'p_name', header: 'Partner Name', render: (item: any) => <span>{item?.partner?.name}</span> },
    { accessorKey: 'deleted_at', header: 'Deleted At' },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => (
        <Button size='xs' onClick={() => restoreConfirmation(item)}>
          Restore
        </Button>
      ),
    },
  ];

  return (
    <>
      <TableComponent columns={columns} data={customerList} />
      <ConfirmationDialog
        isOpen={showRestoreCustomerModal}
        onClose={() => {
          setRestoreCustomerModal(false);
          setSelectedItem({});
        }}
        buttons={[
          {
            text: 'Restore',
            variant: 'default',
            size: 'sm',
            onClick: handleYesClick,
            btnLoading: isLoading,
            icon: isLoading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg'
      >
        Do You Really Want To Restore This Customer?
      </ConfirmationDialog>
    </>
  );
};

export default RestoreCustomerList;
