import React, { FC, useState } from 'react';
import MyDialog from '../MyDialog';
import TableComponent from '../Table';
import { YYYYMMDD } from '@/utils/utils';
import moment from 'moment';
import { IconLoading } from '@/utils/Icons';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { useParams } from 'next/navigation';
import ConfirmationDialog from '../ConfirmationDialog';

interface AmcActionDialogProps {
  open: boolean;
  onClose?: (isFetch?: boolean) => void;
  lists: any;
  isViewSelectedDevice?: boolean;
  apiBaseUrl: { [key: string]: string };
}

const AmcActionDialog: FC<AmcActionDialogProps> = ({
  open,
  onClose,
  lists,
  isViewSelectedDevice,
  apiBaseUrl,
}) => {
  const [list, setList] = useState(lists);
  const [isLoading, setLoading] = useState(false);
  const [confirmationActionDialog, setConfirmationActionDialog] =
    useState(false);

  const apiAction = useMutation(apiCall);
  const { id } = useParams();

  const onConfirmation = () => {
    setConfirmationActionDialog(true);
  };

  const onTerminateClick = async () => {
    setLoading(true);
    try {
      let amcIds = list.map((x: any) => x.id);
      let body = {
        amc_ids: amcIds,
      };
      const actionRequest = {
        endpoint: `${apiBaseUrl?.CUSTOMERS}/${id}/amc/terminated`,
        method: 'post',
        body,
      };

      const { data, isError } = await apiAction.mutateAsync(actionRequest);
      if (!isError) return data;
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
      if (onClose) onClose(true);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Device',
      render: (item: any) => (
        <span className={isViewSelectedDevice ? 'pbYellow' : ''}>
          {item?.device?.name}
        </span>
      ),
    },
    {
      accessorKey: 'amc',
      header: 'AMC',
      render: (item: any) => <span>{item?.amc_plan?.amc_code}</span>,
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      render: (item: any) => <span>{item?.device?.branch?.name}</span>,
    },
    {
      accessorKey: 'start_date',
      header: '	Start Date',
      render: (item: any) => (
        <span>{moment(item?.start_date).format(YYYYMMDD)}</span>
      ),
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      render: (item: any) => (
        <span>{moment(item?.end_date).format(YYYYMMDD)}</span>
      ),
    },
  ];

  return (
    <MyDialog
      open={open}
      onClose={() => onClose?.()}
      title={isViewSelectedDevice ? 'AMC Devices' : 'Cancel Amc'}
      ClassName='sm:max-w-[90%]'
      buttons={
        isViewSelectedDevice
          ? []
          : [
              {
                text: ' Terminate Amc',
                variant: 'blue',
                size: 'sm',
                onClick: onConfirmation,
                btnLoading: isLoading,
                icon: isLoading ? <IconLoading /> : '',
              },
            ]
      }
    >
      <div className='flex grow flex-col overflow-auto p-4'>
        <label className='mb-2 mt-4 block font-semibold'>
          List of selected AMC Devices
        </label>
        <TableComponent
          columns={columns}
          data={list}
          tbodyClass={'min-h-[350px]'}
        />
      </div>
      <ConfirmationDialog
        isOpen={confirmationActionDialog}
        onClose={() => {
          setConfirmationActionDialog(false);
        }}
        buttons={[
          {
            text: 'Terminate',
            variant: 'destructive',
            size: 'sm',
            onClick: onTerminateClick,
            btnLoading: isLoading,
            icon: isLoading ? <IconLoading /> : '',
          },
        ]}
      >
        Do You Really Want to Terminate AMC?
      </ConfirmationDialog>
    </MyDialog>
  );
};

export default AmcActionDialog;
