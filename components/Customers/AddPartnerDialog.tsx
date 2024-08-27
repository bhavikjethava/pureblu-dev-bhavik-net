import { FC, useContext, useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import { IconLoading } from '@/utils/Icons';
import SelectBox from '../SelectBox';
import { DataContext } from '@/context/dataProvider';
import { CUSTOMER, PARTNERS } from '@/utils/utils';
import TableComponent from '../Table';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { isRequired } from '@/utils/ValidationUtils';
import { ScrollArea } from '../ui/scroll-area';

interface AddPartnerDialogProps {
  open: boolean;
  onClose?: () => void;
  onSave?: () => void;
  apiBaseUrl: any;
}

interface DataProps {
  [Key: string]: any;
}

interface Column {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

const deviceListColumns: Column[] = [
  {
    accessorKey: 'name',
    header: 'Device Name',
    render: (item: any) => <span>{item?.device?.name}</span>,
  },
  {
    accessorKey: 'p_name',
    header: 'Partner Name',
    render: (item: any) => <span>{item?.partner?.name}</span>,
  },
];
const branchListColumns: Column[] = [
  { accessorKey: 'name', header: 'Branch Name' },
  {
    accessorKey: 'p_name',
    header: 'Partner Name',
    render: (item: any) => <span>{item?.partner?.name}</span>,
  },
];
const customerListColumns: Column[] = [
  { accessorKey: 'name', header: 'Customer Name' },
  {
    accessorKey: 'p_name',
    header: 'Partner Name',
  },
];

const AddPartnerDialog: FC<AddPartnerDialogProps> = ({
  open,
  onClose,
  apiBaseUrl,
  onSave,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<DataProps>({});
  const { state } = useContext(DataContext);
  const [customerInfo, setCustomerInfo] = useState<DataProps>({});
  const [partnerInfo, setPartnerInfo] = useState<DataProps>({});
  const [selectedPartner, setSelectedPartner] = useState<DataProps>({});

  const apiAction = useMutation(apiCall);
  useEffect(() => {
    let customer = state?.[CUSTOMER];
    if (customer) {
      setCustomerInfo(customer);
      setSelectedPartner({ id: customer?.partner_id });
      fetchPartnerInfo(customer?.id);
    }
  }, [state?.[CUSTOMER]]);

  const fetchPartnerInfo = async (customerId: number) => {
    try {
      const fetchPartnerInfo = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/partner-info`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchPartnerInfo);
      if (data) {
        setPartnerInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onPartnerChangeHandler = (key: string, value: string) => {
    setSelectedPartner((prev) => ({
      ...prev,
      [key]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [key]: '',
    }));
  };

  const handleSave = async () => {
    const { id } = selectedPartner;
    if (!isRequired(id)) {
      setErrors({ id: `Please select partner` });
      return;
    }
    try {
      setLoading(true);
      const assignPartner = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerInfo?.id}/assign-full-partner`,
        method: 'POST',
        body: {
          partner_id: id,
        },
      };
      const { data } = await apiAction.mutateAsync(assignPartner);
      if (data) {
        setSelectedPartner({});
        onSave?.();
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Add / Edit Partner'
      ClassName='h-full grow max-h-[85%] min-w-[80%]'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: handleSave,
          btnLoading: isLoading,
          icon: isLoading ? <IconLoading /> : '',
        },
      ]}
    >
      <div className='flex h-[80%] grow  flex-col p-5'>
        <SelectBox
          label='Partner'
          isRequired={true}
          options={state?.[PARTNERS]}
          value={selectedPartner?.id}
          onChange={(e) => onPartnerChangeHandler('id', e)}
          error={errors?.id}
        />
        <ScrollArea className='grow '>
          <div className='mt-7'>
            <span className='mb-2 block font-semibold'>Device List</span>
            <TableComponent
              columns={deviceListColumns}
              data={partnerInfo?.device || []}
            />
          </div>
          <div className='mt-7'>
            <span className='mb-2 block font-semibold'>Branch List</span>
            <TableComponent
              columns={branchListColumns}
              data={partnerInfo?.branch || []}
            />
          </div>
          <div className='mt-7'>
            <span className='mb-2 block font-semibold'>Customer List</span>
            <TableComponent
              columns={customerListColumns}
              data={
                customerInfo?.partner_id
                  ? [
                      {
                        name: customerInfo?.name,
                        p_name: customerInfo?.partner?.name,
                      },
                    ]
                  : []
              }
            />
          </div>
        </ScrollArea>
      </div>
    </MyDialog>
  );
};

export default AddPartnerDialog;
