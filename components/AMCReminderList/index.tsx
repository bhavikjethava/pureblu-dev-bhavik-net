'use client';
import Breadcrumb from '../Breadcrumb';
import DatepickerComponent from '../DatePicker';
import {
  IconClockTimeThreeOutline,
  IconDownload,
  IconLoading,
} from '@/utils/Icons';
import { Button } from '../ui/button';
import TableComponent from '../Table';
import { useMutation } from 'react-query';
import { apiCall, downloadFile } from '@/hooks/api';
import { ArrayProps, OptionType, getBaseUrl, updateArray } from '@/utils/utils';
import { FC, useState } from 'react';
import moment from 'moment';
import MyDialog from '../MyDialog';
import SelectBox from '../SelectBox';
import Loader from '../Loader';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MultiSelectDropdown from '../MultiSelect';
import { ERROR_MESSAGES } from '@/utils/ValidationUtils';

interface AMCReminderColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

interface AMCReminderProps {
  apiBaseUrl: any;
}

const AmcReminderList: FC<AMCReminderProps> = ({ apiBaseUrl }) => {
  const [amcReminder, setAMCReminder] = useState<ArrayProps[] | null>([]);
  const [formData, setFormData] = useState<any>({
    startDate: null,
    endDate: null,
  });
  const [sendReminder, setSendReminder] = useState<ArrayProps | null>(null);
  const [emailList, setEmailList] = useState<OptionType[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [fetchLoader, setFetchLoader] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isExportLoader, setExportLoader] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);

  const onChnage = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  const displaySendRemindeModal = (item: any) => {
    setSendReminder(item);
    const emails: OptionType[] = [];
    if (item?.email) {
      emails.push({ id: 1, name: item?.email });
    }
    if (item?.email_1) {
      emails.push({ id: 2, name: item?.email_1 });
    }
    if (item?.email_2) {
      emails.push({ id: 3, name: item?.email_2 });
    }
    setEmailList(emails);
    if (emails.length > 0) {
      setSelectedEmail(emails[0]);
    }
  };

  const onClose = () => {
    setSendReminder(null);
  };

  const handleInputChange = (value: any) => {
    setSelectedEmail(value);
  };

  const fetchAMCReminder = async () => {
    const { startDate, endDate } = formData;
    let isError = false;
    const errors: any = {};
    if (moment(endDate).isBefore(moment(startDate))) {
      errors['endDate'] = ERROR_MESSAGES.fromDateGreater;
      isError = true;
    }
    if (isError) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setFetchLoader(true);
    setAMCReminder(null);
    try {
      let url = `${apiBaseUrl?.AMC_REMINDER}?`;
      if (startDate) {
        url += `start_date=${moment(startDate).format('YYYY-MM-DD')}&`;
      }
      if (endDate) {
        url += `end_date=${moment(endDate).format('YYYY-MM-DD')}`;
      }
      const getAMCReminder = {
        endpoint: `${url}`,
        method: 'GET',
      };
      const { data: amdReminder } = await apiAction.mutateAsync(getAMCReminder);
      if (amdReminder) {
        setAMCReminder(amdReminder);
      } else {
        setAMCReminder([]);
      }
    } catch (e: any) {
      console.log('error in fetch', e.message);
    } finally {
      setFetchLoader(false);
    }
  };

  const onSendreminder = async () => {
    try {
      setLoading(true);
      const postRemnder = {
        endpoint: `${apiBaseUrl?.SEND_REMINDER}`,
        method: 'POST',
        body: {
          customer_id: sendReminder?.id,
          email: selectedEmail.name,
        },
      };
      const { data: reminderResponse } =
        await apiAction.mutateAsync(postRemnder);
      if (reminderResponse) {
        onClose();
      }
    } catch (e: any) {
      console.log('error in fetch', e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportExpired = async (item?: any) => {
    const { startDate, endDate } = formData;
    try {
      let url = `${apiBaseUrl?.EXPORT_AMC_REMINDER_LIST}?`;
      if (item?.id) {
        url = `${apiBaseUrl?.AMC_CUSTOMER}${item?.id}/export-expired-devices?`;
        item.isDownloading = true;
        setAMCReminder([...updateArray(amcReminder || [], item)]);
      } else {
        setExportLoader(true);
      }

      if (startDate) {
        url += `start_date=${moment(startDate).format('YYYY-MM-DD')}&`;
      }
      if (endDate) {
        url += `end_date=${moment(endDate).format('YYYY-MM-DD')}`;
      }
      let isError = false;
      const errors: any = {};
      if (moment(endDate).isBefore(moment(startDate))) {
        errors['endDate'] = ERROR_MESSAGES.fromDateGreater;
        isError = true;
      }
      if (isError) {
        setErrors(errors);
        return;
      }
      setErrors({});
      const blob: Blob = await downloadFile(url);
      const blobUrl: string = window.URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download =
        item?.name === undefined
          ? 'AMC-expiry-reminder-list.xlsx'
          : `${item.name}.xlsx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      console.log('error in fetch', e.message);
    } finally {
      if (item?.id) {
        item.isDownloading = false;
        setAMCReminder([...updateArray(amcReminder || [], item)]);
      } else {
        setExportLoader(false);
      }
    }
  };

  const onListDownloadClick = () => {
    exportExpired(null);
  };

  const columns: AMCReminderColumn[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      render: (item: any) => (
        <Link
          href={`/${basePath}/dashboard/customers/${item?.id}`}
          className='flex font-bold text-blueButton-default'
        >
          <div className='flex'>{`${item?.name}`}</div>
        </Link>
      ),
    },
    { accessorKey: 'number_of_device', header: 'No of Devices' },
    { accessorKey: 'start_date', header: 'Start Date' },
    { accessorKey: 'end_date', header: 'End Date' },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: any) => (
        <div className='flex gap-3'>
          <Button
            variant='destructive'
            size='xs'
            onClick={() => displaySendRemindeModal(item)}
            icon={<IconClockTimeThreeOutline className='h-4 w-4 text-white' />}
          >
            Send Reminder
          </Button>
          <Button
            variant='blue'
            size='xs'
            disabled={item?.isDownloading}
            onClick={() => exportExpired(item)}
            icon={
              <span className='min-w-4'>
                {item?.isDownloading ? (
                  <IconLoading className='h-4 w-4' />
                ) : (
                  <IconDownload className='h-4 w-4' />
                )}
              </span>
            }
          >
            Export Expired
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col gap-5 bg-white p-5'>
      <Breadcrumb />

      <div className='grid w-full grid-cols-1 gap-5 lg:grid-cols-9'>
        <div className='lg:col-span-3'>
          <DatepickerComponent
            label=''
            placeholderText='From'
            dateFormat='dd/MM/yyyy'
            onChange={(e) => {
              onChnage('startDate', e);
            }}
            selectedDate={formData.startDate}
          />
        </div>
        <div className='lg:col-span-3'>
          <DatepickerComponent
            label=''
            placeholderText='To'
            dateFormat='dd/MM/yyyy'
            onChange={(e) => {
              onChnage('endDate', e);
            }}
            selectedDate={formData.endDate}
            error={errors?.endDate}
          />
        </div>
        <div className='flex gap-5 lg:col-span-3'>
          <Button
            variant='blue'
            onClick={fetchAMCReminder}
            disabled={fetchLoader}
          >
            Search
          </Button>
          {formData?.startDate &&
          formData?.endDate &&
          (amcReminder?.length || 0) > 0 ? (
            <Button
              color='success'
              className='pr-2'
              disabled={isExportLoader}
              icon={
                isExportLoader ? (
                  <IconLoading />
                ) : (
                  <IconDownload className='h-4 w-4 text-white' />
                )
              }
              onClick={onListDownloadClick}
            />
          ) : null}
        </div>
      </div>
      <TableComponent columns={columns} data={amcReminder} />
      <MyDialog
        open={sendReminder?.id !== undefined}
        onClose={onClose}
        title='Add / Edit Action Check List'
        // ClassName='sm:max-w-[50%]'
        buttons={[
          {
            text: 'Send Reminder',
            variant: 'yellow',
            size: 'sm',
            onClick: onSendreminder,
            disabled: isLoading,
            icon: isLoading ? <IconLoading /> : '',
          },
        ]}
      >
        <div className='flex h-20 grow flex-col overflow-auto'>
          <div className='gap-5'>
            <div className='absolute'>
              <div className='grid grid-cols-2 items-center p-4'>
                <label className='mb-2 block font-bold'>
                  Select Email-Address
                </label>
                {/* <SelectBox
              label=''
              options={emailList}
              value={selectedEmail}
              onChange={(e) => handleInputChange(e)}
            /> */}
                <div>
                  <MultiSelectDropdown
                    isMulti={false}
                    options={emailList}
                    closeMenuOnSelect={true}
                    getOptionValue={(option) => option?.id}
                    getOptionLabel={(option) => option?.name}
                    onChange={(selectedValues: any) =>
                      handleInputChange(selectedValues)
                    }
                    value={selectedEmail}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MyDialog>
    </div>
  );
};

export default AmcReminderList;
