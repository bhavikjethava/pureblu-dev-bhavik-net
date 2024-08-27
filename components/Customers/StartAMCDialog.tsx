import React, { FC, useContext, useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import { IconDeleteBinLine, IconLoading } from '@/utils/Icons';
import InputField from '../InputField';
import { ScrollArea } from '../ui/scroll-area';
import SelectBox from '../SelectBox';
import TableComponent from '../Table';
import DatepickerComponent from '../DatePicker';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import SelectAsync, { OptionProps } from '../SelectAsync';
import { debounce } from 'lodash';
import { BRANCHLIST, YYYYMMDD, updateArray } from '@/utils/utils';
import { validateForm } from '@/utils/FormValidationRules';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';
import { AnyPtrRecord } from 'dns';
import moment from 'moment';
import MultiSelectDropdown from '../MultiSelect';
import { DataContext } from '@/context/dataProvider';

const allowedFileTypes = [
  'application/pdf',
  'application/vnd.ms-excel',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'text/plain',
];

interface StartAMCDialogProps {
  open: boolean;
  onClose?: (isRefech?: boolean, item?: any) => void;
  startNewAMCDevices: any;
  customerData: FormData;
  customerId: string | string[];
  isRenewAMC?: boolean;
  apiBaseUrl?: { [Key: string]: string };
}

interface FormData {
  [key: string]: any;
}

interface Email {
  id: string;
  email: string;
}

const actionList = [
  { id: 1, name: 'Activate' },
  { id: 2, name: 'Extend' },
];

const StartAMCDialog: FC<StartAMCDialogProps> = ({
  open,
  onClose,
  startNewAMCDevices,
  customerData,
  customerId,
  isRenewAMC,
  apiBaseUrl,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    quotationKey: '',
    discount: 0,
    email: { id: '1', email: customerData.email },
  });
  const [errors, setErrors] = useState<FormData>({});
  const [selectedAMCDeviceList, setSelectedAMCDeviceList] =
    useState(startNewAMCDevices);
  const [selectedAMC, setSelectedAMC] = useState<FormData>();
  const [customerEmailList, setCustomerEmailList] = useState<Array<Email>>([]);

  const apiAction = useMutation(apiCall);
  const { state } = useContext(DataContext);

  useEffect(() => {
    let email = [{ id: '1', email: customerData.email }];
    if (customerData?.email_1)
      email.push({ id: '2', email: customerData.email_1 });
    if (customerData.email_2)
      email.push({ id: '3', email: customerData.email_2 });
    state?.[BRANCHLIST]?.map((branch: any) => {
      if (branch?.email) {
        email.push({ id: `${email.length + 1}`, email: branch?.email });
      }
    });
    const uniqueEmails: any = [];
    const uniqueData = email?.filter((item) => {
      if (!uniqueEmails?.includes(item?.email)) {
        uniqueEmails.push(item?.email);
        return true;
      }
      return false;
    });
    setCustomerEmailList(uniqueData);
  }, []);

  const debouncedSearch = debounce(async (text: string) => {
    if (text.length > 1) {
      try {
        const fetchBranch = {
          endpoint: `${apiBaseUrl?.AMC_PLANS}?search=${text}&need_all=1`,
          method: 'GET',
        };

        const { data } = await apiAction.mutateAsync(fetchBranch);
        return data;
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      }
    }
  }, 500);

  const onAMCSearch = async (text: string) => {
    // return debouncedSearch(text);
    if (text.length > 1) {
      try {
        const fetchBranch = {
          endpoint: `${apiBaseUrl?.AMC_PLANS}?search=${text}&need_all=1`,
          method: 'GET',
        };

        const { data } = await apiAction.mutateAsync(fetchBranch);
        return data;
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      }
    }
  };

  const handleInputChange = (
    field: string,
    value: string | Date | File | null
  ) => {
    let quotationError = false;
    if (field === 'quotation' && value) {
      const file: any = value;
      if (allowedFileTypes.includes(file?.type)) {
        setFormData((pre) => ({
          ...pre,
          [field]: value,
        }));
      } else {
        setFormData((pre) => ({
          ...pre,
          quotationKey: file?.name,
        }));
        quotationError = true;
      }
    } else {
      setFormData((pre) => ({
        ...pre,
        [field]: value,
      }));
    }
    if (quotationError) {
      setErrors((pre) => ({
        ...pre,
        quotation:
          'The quotation field must be a file of type: jpg, png, jpeg, pdf, docx, xlsx, zip, xls',
      }));
    } else {
      setErrors((pre) => ({ ...pre, [field]: '' }));
    }
  };

  const onDateChange = (field: string, value: Date | null) => {
    handleInputChange(field, value);
    let tempSelectedAMCDeviceList = selectedAMCDeviceList.map((x: any) => ({
      ...x,
      [field]: value,
      ...(field === 'start_date' && {
        end_date: moment(value).add(364, 'd').toDate(),
      }),
      [`${field}_error`]: '',
    }));
    if (field === 'start_date') {
      setFormData((pre) => ({
        ...pre,
        end_date: moment(value).add(364, 'd').toDate(),
      }));
    }
    setSelectedAMCDeviceList(tempSelectedAMCDeviceList);
  };

  const handleAMCInputChange = (
    field: string,
    item: any,
    value: Date | string | number | null
  ) => {
    item[field] = value;
    item[`${field}_error`] = '';
    let temp = updateArray(selectedAMCDeviceList, item);
    setSelectedAMCDeviceList([...temp]);
  };

  const onActivate = async () => {
    const { amount, quotation, discount } = formData;

    const valifationRules = [
      { field: 'amount', value: amount, message: 'Amount' },
      { field: 'discount', value: discount, message: 'Discount' },
      // { field: 'quotation', value: quotation, message: 'Quotation' },
      { field: 'amc_plan_id', value: selectedAMC, message: 'AMC' },
    ];

    let { isError, errors } = validateForm(valifationRules);
    if (isError) {
      setErrors(errors);
    }

    let temp = selectedAMCDeviceList.map((x: any) => {
      if (!isRequired(x.start_date)) {
        x.start_date_error = `Start date${ERROR_MESSAGES.required}`;
        isError = true;
      }
      if (!isRequired(x.end_date)) {
        x.end_date_error = `End date${ERROR_MESSAGES.required}`;
        isError = true;
      }
      if (new Date(x.start_date) > new Date(x.end_date)) {
        x.end_date_error = `The end date can not be less then the start date`;
        isError = true;
      }
      return {
        ...x,
      };
    });

    if (isError) {
      setSelectedAMCDeviceList(temp);
    } else {
      let formBody = new FormData();
      Object.keys(formData).map((x) => {
        if (x == 'start_date' || x == 'end_date') return;
        if (x == 'email') {
          formBody.append(x, formData[x]?.email || '');
        } else {
          formBody.append(x, formData[x]);
        }
      });
      if (isRenewAMC) {
        selectedAMCDeviceList.map((x: any, index: number) => {
          formBody.append(`amc[${index}][id]`, x.amc.id);
          formBody.append(`amc[${index}][amc_plan_id]`, selectedAMC?.id);
          formBody.append(
            `amc[${index}][start_date]`,
            moment(x.start_date).format(YYYYMMDD)
          );
          formBody.append(
            `amc[${index}][end_date]`,
            moment(x.end_date).format(YYYYMMDD)
          );
          formBody.append(
            `amc[${index}][action]`,
            x.action || actionList[0].id
          );
        });
      } else {
        selectedAMCDeviceList.map((x: any, index: number) => {
          formBody.append(`devices[${index}][device_id]`, x.id);
          formBody.append(`devices[${index}][amc_plan_id]`, selectedAMC?.id);
          formBody.append(
            `devices[${index}][start_date]`,
            moment(x.start_date).format(YYYYMMDD)
          );
          formBody.append(
            `devices[${index}][end_date]`,
            moment(x.end_date).format(YYYYMMDD)
          );
        });
      }
      if (quotation) {
        formBody.append(`quotation`, quotation);
      }
      setLoading(true);

      try {
        const postAMC = {
          endpoint: `${apiBaseUrl?.CUSTOMERS}/${customerId}/amc/${
            isRenewAMC ? 'renew-amc' : 'register-amc'
          }`,
          method: 'POST',
          body: formBody,
          isFormData: true,
        };

        const { data, isError, errors } = await apiAction.mutateAsync(postAMC);
        setLoading(false);
        if (isError) {
          setErrors(errors);
        } else {
          if (isRenewAMC) onClose?.(true);
          else onClose?.(true, data);
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onDeleteItem = (item: any) => {
    setSelectedAMCDeviceList((pre: any) =>
      pre.filter((x: any) => x.id != item?.id)
    );
  };

  const columns = [
    { accessorKey: 'name', header: 'Device' },
    {
      accessorKey: 'amc',
      header: (
        <div>
          {/* <InputField
            type='text'
            label='AMC'
            value={selectedAMC?.name || ''}
            onChange={(text) => onAMCSearch(text)}
            error={errors?.discount || ''}
          /> */}
          <label className='mb-2 block font-bold'>AMC</label>
          <SelectAsync
            onSearch={onAMCSearch}
            getOptionLabel={(x: any) => x.amc_code}
            onChange={(amc: OptionProps) => {
              setSelectedAMC(amc);
              setErrors((pre) => ({ ...pre, amc_plan_id: '' }));
            }}
            error={errors?.amc_plan_id}
          />
        </div>
      ),
      render: (item: any) => (
        <span className={isRenewAMC ? 'pbYellow' : ''}>
          {selectedAMC?.amc_code || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      render: (item: any) => <span>{item?.branch?.name}</span>,
    },
    {
      accessorKey: 'start_date',
      header: (
        <DatepickerComponent
          label='Start Date'
          dateFormat='dd/MM/yyyy'
          onChange={(e) => onDateChange('start_date', e)}
          selectedDate={formData.start_date}
        />
      ),
      render: (item: any) => (
        <DatepickerComponent
          label=''
          dateFormat='dd/MM/yyyy'
          onChange={(e) =>
            handleAMCInputChange(
              'start_date',
              item,
              e ? +e : actionList?.[0]?.id
            )
          }
          selectedDate={item.start_date}
          error={item?.start_date_error}
        />
      ),
    },
    {
      accessorKey: 'end_date',
      header: (
        <DatepickerComponent
          label='End Date'
          dateFormat='dd/MM/yyyy'
          onChange={(e) => onDateChange('end_date', e)}
          selectedDate={formData.end_date}
        />
      ),
      render: (item: any) => (
        <DatepickerComponent
          label=''
          dateFormat='dd/MM/yyyy'
          onChange={(e) => handleAMCInputChange('end_date', item, e)}
          selectedDate={item.end_date}
          error={item?.end_date_error}
        />
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => (
        <>
          <div
            onClick={() => {
              onDeleteItem(item);
            }}
          >
            <IconDeleteBinLine className='h-6 w-6' />
          </div>
          <div className='pl-5'>
            <SelectBox
              label=''
              options={actionList}
              value={item?.action || actionList[0].id}
              onChange={(e) => handleAMCInputChange('action', item, e)}
            />
          </div>
        </>
      ),
    },
  ];
  if (!isRenewAMC) {
    columns.splice(-1);
  }

  return (
    <MyDialog
      open={open}
      onClose={() => onClose?.()}
      title={isRenewAMC ? 'Renew Amc' : 'Start Amc'}
      // ClassName='sm:max-w-[90%]'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
      buttons={[
        {
          text: isRenewAMC ? 'Submit' : 'Activate',
          variant: 'blue',
          size: 'sm',
          onClick: onActivate,
          btnLoading: isLoading,
          disabled: ((selectedAMCDeviceList || []).length || 0) == 0,
          icon: isLoading ? <IconLoading /> : '',
        },
      ]}
    >
      {/* <ScrollArea className='grow'> */}
      <div className='flex grow flex-col overflow-auto p-4'>
        <div className='mb-5 grid grid-cols-2 gap-5'>
          <InputField
            type='number'
            label='Total Amount'
            isRequired
            value={formData?.amount || ''}
            onChange={(e) => handleInputChange('amount', e)}
            error={errors?.amount || ''}
          />
          <InputField
            type='number'
            label='Discount Amount'
            isRequired
            value={formData?.discount || 0}
            onChange={(e) => handleInputChange('discount', e)}
            error={errors?.discount || ''}
          />
          {/* <SelectBox
            isRequired
            label='Email'
            options={customerEmailList}
            value={formData?.email || ''}
            onChange={(e) => handleInputChange('email', e.toString())}
            error={errors?.email || ''}
          /> */}
          <div>
            <MultiSelectDropdown
              isMulti={false}
              options={customerEmailList}
              closeMenuOnSelect={true}
              label='Email'
              isRequired
              getOptionValue={(option) => option?.id}
              getOptionLabel={(option) => option?.email}
              onChange={(selectedValues: any) =>
                handleInputChange('email', selectedValues)
              }
              value={formData?.email}
            />
          </div>
          <InputField
            type='file'
            accept='.pdf,.xls,.jpg,.xlsx,.png,.jpeg,.docx,.zip,.txt'
            label='Attach Quote'
            key={formData?.quotationKey}
            //   value={formData?.quotation}
            onChange={(e) =>
              handleInputChange('quotation', e?.target?.files[0])
            }
            error={errors?.quotation || ''}
          />
        </div>
        <>
          <label className='mb-2 mt-4 block font-semibold'>
            List of selected AMC Devices
          </label>
        </>

        <TableComponent
          columns={columns}
          data={selectedAMCDeviceList}
          tbodyClass={'min-h-[350px]'}
        />
      </div>
      {/* </ScrollArea> */}
    </MyDialog>
  );
};

export default StartAMCDialog;
