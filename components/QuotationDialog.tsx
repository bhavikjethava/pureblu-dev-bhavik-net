import React, { useContext, useEffect, useState } from 'react';
import MyDialog from './MyDialog';
import { IconLoading } from '@/utils/Icons';
import { ScrollArea } from './ui/scroll-area';
import InputField from './InputField';
import SelectBox from './SelectBox';
import TableComponent from './Table';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { apiCall } from '@/hooks/api';
import { useMutation } from 'react-query';
import { CUSTOMER } from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';

interface FormData {
  [key: string]: any;
}

const quotationColumns = [
  {
    accessorKey: 'created_at',
    header: 'Quotation Date',
    render: (item: any) => (
      <span className='font-bold'>{item?.created_at}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    render: (item: any) => <span className='font-bold'>{item?.amount}</span>,
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
    render: (item: any) => <span className='font-bold'>{item?.discount}</span>,
  },
  {
    accessorKey: 'final_amount',
    header: 'Final Amount',
    render: (item: any) => (
      <span className='font-bold'>{+item?.amount - +item?.discount}</span>
    ),
  },
  {
    accessorKey: 'file',
    header: 'File',
    render: (item: any) => (
      <a target='_blank' href={item?.quotation} className='text-pbHeaderBlue'>
        <span>{item?.quotation?.replace(/^.*[\\/]/, '')}</span>
      </a>
    ),
  },
];
let customerData: FormData;

const QuotationDialog = ({
  apiBaseUrl,
  open,
  onClose,
  selectedComplaint,
}: any) => {
  const [quotationData, setQuotationData] = useState<FormData>({
    email: 1,
  });
  const { state, setData } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormData>();
  const [customerEmails, setCustomerEmails] = useState<Array<FormData>>([]);
  const [quotationList, setQuotationList] = useState<Array<FormData> | null>();
  const apiAction = useMutation(apiCall);

  useEffect(() => {
    if (selectedComplaint?.id != undefined) {
      fetchQuotation();
    }

    if (state?.customer?.id === selectedComplaint?.customer_id) {
      customerData = state?.customer;
    } else {
      fetchCustomersDetail();
    }
  }, [selectedComplaint?.id]);

  const fetchCustomersDetail = async () => {
    try {
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedComplaint?.customer_id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setData({ [CUSTOMER]: response?.data });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  useEffect(() => {
    let customerInfo = state?.[CUSTOMER];
    let emails: Array<FormData> = [{ id: 1, name: state?.[CUSTOMER]?.email }];
    if (customerInfo?.email_1) {
      emails.push({ id: 2, name: customerInfo.email_1 });
    }
    if (customerInfo?.email_2) {
      emails.push({ id: 3, name: customerInfo.email_2 });
    }
    setCustomerEmails(emails);
  }, [state?.[CUSTOMER]]);

  const handleQuatationSave = async () => {
    const { amount, discount, email, quotation } = quotationData;
    const valifationRules = [
      { field: 'amount', value: amount, message: 'Amount' },
      { field: 'discount', value: discount, message: 'Discount' },
      {
        field: 'quotation',
        value: quotation,
        message: 'Quotation',
        type: VALIDATIONTYPE.ISFILE,
      },
    ];

    let { isError, errors } = validateForm(valifationRules);
    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      let formData = new FormData();
      Object.keys(quotationData).map((key: string) => {
        if (key == 'email') {
          formData.append(
            key,
            customerEmails.find((x: any) => x.id == quotationData[key])?.name
          );
        } else {
          formData.append(key, quotationData[key]);
        }
      });

      try {
        const postQuotation = {
          endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedComplaint.customer_id}/request/${selectedComplaint?.id}/parts-quotation`,
          method: 'POST',
          body: formData,
          isFormData: true,
        };
        const { data, errors } = await apiAction.mutateAsync(postQuotation);
        if (data) {
          onClose();
          setQuotationData({ email: 1 });
        } else {
          setErrors(errors);
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuotationChange = (key: string, value: any, type?: string) => {
    if (type == 'file') {
      if (value?.target?.files && value?.target?.files[0]) {
        let file = value.target.files[0];
        setQuotationData((prev) => ({ ...prev, [key]: file }));
      }
    } else {
      setQuotationData((prev) => ({ ...prev, [key]: value }));
    }
    setErrors((prev) => ({
      ...prev,
      [key]: '',
    }));
  };

  const fetchQuotation = async () => {
    try {
      const fetchStatus = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedComplaint.customer_id}/request/${selectedComplaint?.id}/parts-quotation?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchStatus);
      if (data) {
        setQuotationList(data);
      } else {
        setQuotationList([]);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      ClassName='sm:max-w-[90%] grow max-h-[80%] h-full'
      title='Send Quotation'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: () => handleQuatationSave(),
          btnLoading: loading,
          icon: loading ? <IconLoading /> : '',
        },
      ]}
    >
      <ScrollArea className='grow'>
        <div className='flex h-full grow flex-col gap-4 p-4'>
          <div className='flex flex-col gap-4 '>
            <InputField
              type='text'
              label='Amount'
              label2='INR'
              className='grid grid-cols-2 items-center gap-3'
              value={quotationData?.amount || ''}
              onChange={(e) => handleQuotationChange('amount', e)}
              error={errors?.amount || ''}
            />
            <InputField
              type='text'
              label='Discount'
              label2='INR'
              className='grid grid-cols-2 items-center gap-3'
              value={quotationData?.discount || ''}
              onChange={(e) => handleQuotationChange('discount', e)}
              error={errors?.discount || ''}
            />
            <SelectBox
              label='Email'
              className='grid grid-cols-2 items-center gap-3'
              options={customerEmails}
              value={quotationData?.email || ''}
              onChange={(e) => handleQuotationChange('email', Number(e))}
              error={errors?.email || ''}
            />

            <div className='grid gap-5'>
              <InputField
                type='file'
                label='Attach Quote'
                className='grid grid-cols-2 items-center gap-3'
                // accept='image/*'
                onChange={(e) => handleQuotationChange('quotation', e, 'file')}
                error={errors?.quotation || ''}
              />
            </div>
          </div>

          <h3 className='pt-5 text-lg font-semibold'>Quotation History</h3>
          <div className='flex h-40 flex-col'>
            <TableComponent columns={quotationColumns} data={quotationList} />
          </div>
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default QuotationDialog;
