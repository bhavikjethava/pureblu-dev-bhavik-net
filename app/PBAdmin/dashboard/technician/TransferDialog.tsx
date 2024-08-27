import ConfirmationDialog from '@/components/ConfirmationDialog';
import MyDialog from '@/components/MyDialog';
import Radio from '@/components/Radio';
import SearchInput from '@/components/SearchInput';
import TableComponent from '@/components/Table';
import { DataContext } from '@/context/dataProvider';
import { apiCall } from '@/hooks/api';
import { IconLoading } from '@/utils/Icons';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  onTransfer?: (newData: any) => void;
  isLoading: boolean;
  id: string;
  apiBaseUrl: any;
}

interface AssignPartnerColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

export type AssignPartner = {
  id: string;
  name: string;
  phone: string;
  button: any;
};

interface FormData {
  [key: string]: string;
}

interface UserTypes {
  [key: string]: any;
}

const TransferDialog: FC<DialogProps> = ({
  open,
  onClose,
  onTransfer,
  id,
  isLoading,
  apiBaseUrl,
}) => {
  const apiAction = useMutation(apiCall);
  const { state } = useContext(DataContext);
  const [partnerList, setPartnerList] = useState<UserTypes | undefined>();
  const [filteredItemData, setfilteredItemData] = useState<UserTypes>();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchPartner();
  }, [id]);

  useEffect(() => {
    // Filter data based on the search term
    const filteredItemData = partnerList?.filter((item: any) => {
      return Object.values(item as { [key: string]: unknown }).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setfilteredItemData(filteredItemData);
  }, [searchTerm, partnerList]);

  const fetchPartner = async () => {
    const getPartner = {
      endpoint: `${apiBaseUrl.PARTNER}?need_all=1`,
      method: 'GET',
    };
    const { data: allPartner } = await apiAction.mutateAsync(getPartner);
    setPartnerList(allPartner);
  };

  const handleRadioChange = (radioId: string, isChecked: boolean) => {
    setSelectedPartnerId(isChecked ? radioId : null);
    setConfirmationDialogOpen(true);
  };

  const columnsData: AssignPartnerColumn[] = [
    {
      accessorKey: 'action',
      header: '',
      className: 'max-w-[40px] !px-2',
      render: (item: AssignPartner, index: number) => (
        <Radio
          checked={selectedPartnerId === item.id}
          onCheckedChange={(value: boolean) =>
            handleRadioChange(item.id, value)
          }
          ariaLabel=''
          name={`transferPartnerRadioGroup-${index}`} // Unique name for each radio group
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      className: 'max-w-[120px]',
      render: (item: any) => <span>{item?.user?.phone}</span>,
    },
    {
      accessorKey: 'city',
      header: 'City',
      className: 'max-w-[140px]',
      render: (item: any) => <span>{item?.user?.city?.name}</span>,
    },
  ];

  const onTransferHandle = () => {
    let params = {
      partner_id: selectedPartnerId,
    };
    if (onTransfer) {
      onTransfer(params);
    }
  };
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Transfer Technician'
      ClassName='max-h-[90%] sm:max-w-2xl'
      isShowClose={false}
    >
      <div className='flex flex-col gap-5 px-4 pt-5'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Name (Min 3 character) or Contact no (full) or ID'
        />
        <div className='flex h-96 flex-col'>
          <TableComponent columns={columnsData} data={filteredItemData} />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => {
          setConfirmationDialogOpen(false);
        }}
        buttons={[
          {
            text: 'Yes',
            variant: 'destructive',
            size: 'sm',
            onClick: onTransferHandle,
            btnLoading: isLoading,
            icon: isLoading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        Do You Really Want to Transfer to This Record
      </ConfirmationDialog>
    </MyDialog>
  );
};

export default TransferDialog;
