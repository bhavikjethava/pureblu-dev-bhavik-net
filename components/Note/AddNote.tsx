import React, { FC, useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import InputField from '../InputField';
import {
  AUTH,
  TEXTAREA,
  UserData,
  getAuthKeyFromBasePath,
  getAuthKeyFromPath,
} from '@/utils/utils';
import { useParams, usePathname } from 'next/navigation';
import { userInfo } from 'os';
import TableComponent from '../Table';
import { Button } from '../ui/button';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import CheckboxItem from '../CheckboxItem';
import { validateForm } from '@/utils/FormValidationRules';
import { apiCall } from '@/hooks/api';
import { useMutation } from 'react-query';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import DatepickerComponent from '../DatePicker';
import { ScrollArea } from '../ui/scroll-area';
import { showToast } from '../Toast';
import moment from 'moment';

interface AddNoteProps {
  isShow: boolean;
  onClose(): void;
  apiBaseUrl: any;
  complaint?: any;
}

interface FormData {
  [key: string]: any;
}

interface NoteItem {
  [key: string]: any;
}

const options = {
  autoClose: false,
};

let userData: UserData = {};
const AddNote: FC<AddNoteProps> = ({
  isShow,
  onClose,
  apiBaseUrl,
  complaint,
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormData>({});
  const [notes, setNotes] = useState<Array<NoteItem>>();
  const [isLoading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const pathname = usePathname();
  const { id } = useParams();
  const type = getAuthKeyFromPath(pathname);

  const apiAction = useMutation(apiCall);
  useEffect(() => {
    let dbUserInfo = localStorage.getItem(`${type}_user_info`);
    if (dbUserInfo) {
      userData = JSON.parse(dbUserInfo);
    }
    fetchNotes();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (value) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const fetchNotes = async () => {
    try {
      let apiUrl = `${apiBaseUrl.CUSTOMERS}/${id}/note?need_all=1`;

      if (complaint?.id) {
        apiUrl = `${apiBaseUrl.CUSTOMERS}/${complaint.customer_id}/request/${complaint.id}/note?device_id=${complaint?.device_id}&need_all=1`;
      }
      const fetchRequest = {
        endpoint: apiUrl,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setNotes(data);
      else setNotes([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onSaveClick = async () => {
    const { note, is_reminder } = formData;
    const valifationRules = [{ field: 'note', value: note, message: 'Note' }];
    let { isError, errors } = validateForm(valifationRules);

    const currentDate = new Date();
    if (selectedDate <= currentDate && is_reminder) {
      errors['reminderDateTime'] =
        'Reminder DateTime must be greater than or equal to current date and time.';
      isError = true;
    }

    if (isError) {
      setErrors(errors);
    } else {
      try {
        let params = {
          note,
          is_reminder: is_reminder == true ? 1 : 2,
        } as any;

        if (is_reminder) {
          params['reminder_date_time'] = format(
            selectedDate || '',
            'yyyy-MM-dd HH:mm'
          );
        }
        if (complaint?.id) {
          params['device_id'] = complaint?.device_id;
        }
        setLoading(true);

        let apiUrl = `${apiBaseUrl.CUSTOMERS}/${id}/note`;
        if (complaint?.id) {
          apiUrl = `${apiBaseUrl.CUSTOMERS}/${complaint.customer_id}/request/${complaint.id}/note`;
        }
        let updateRequest = {
          endpoint: apiUrl,
          method: 'POST',
          body: params,
        };

        const { data, isError, errors } =
          await apiAction.mutateAsync(updateRequest);
        if (data) {
          data.isLoading = false;
        }
        if (isError) {
          setErrors(errors);
        } else {
          setFormData({});
          fetchNotes();
          setSelectedDate(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const columnsData = [
    {
      accessorKey: 'reminder_date_time',
      header: 'Reminder Date',
      // render: (item: any) => <span>{format(item?.reminder_date_time, 'dd-MM-yyy hh:mm')}</span>,
      render: (item: any) => (
        <span>
          {item?.reminder_date_time
            ? moment(item?.reminder_date_time).format('DD-MM-yyy HH:mm')
            : '-'}
        </span>
      ),
    },
    { accessorKey: 'note', header: 'Note' },
    { accessorKey: 'created_at', header: 'Date' },
    {
      accessorKey: 'created_by_info',
      header: 'Added By',
      render: (item: any) => <span>{item?.created_by_info?.full_name}</span>,
    },
    {
      accessorKey: 'reminder_sent',
      header: 'Reminder Sent',
      render: (item: any) => (
        <span>{item?.is_reminder == 1 ? 'No' : 'Yes'}</span>
      ),
    },
  ];

  return (
    <MyDialog
      open={isShow}
      onClose={onClose}
      title='Add Note'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: onSaveClick,
          icon: isLoading ? <IconLoading /> : '',
        },
      ]}
    >
      <ScrollArea className='flex h-full grow flex-col'>
        <div className='flex grow  flex-col overflow-auto p-6'>
          <div className='flex flex-col gap-3 pb-5'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='md:grid-cols-1'>
                <label className='mb-2 block font-bold'>Note:</label>
              </div>
              <div className='col-span-2 grid-cols-2'>
                <InputField
                  type={TEXTAREA}
                  value={formData?.note || ''}
                  onChange={(e) => handleInputChange('note', e)}
                  error={errors?.note || ''}
                  size='md'
                />
              </div>
            </div>

            <div className='grid min-h-10 grid-cols-3 items-center gap-4'>
              <div className=' flex grid-cols-3 gap-4'>
                <label className='block whitespace-nowrap font-bold'>
                  Added By:
                </label>
                <div className='col-span-2 grid-cols-2 font-normal'>
                  <div>
                    {type == AUTH.PBADMIN ||
                    type == AUTH.PBENTERPRISE ||
                    type === AUTH.ENTERPRISE
                      ? userData?.name
                      : `${userData?.full_name || ''}`}
                  </div>
                </div>
              </div>
              <div className='col-span-2 grid grid-cols-4 items-center'>
                <div className='col-span-1 '>
                  <CheckboxItem
                    key='send_reminder'
                    checked={formData?.is_reminder}
                    onCheckedChange={(checked) =>
                      handleInputChange('is_reminder', checked)
                    }
                    ariaLabel='Send Reminder'
                    id={`send_reminder`}
                  />
                </div>
                <div className='col-span-3 grid grid-cols-1 items-center gap-4'>
                  {formData.is_reminder ? (
                    <>
                      {/* <div className='grid-cols-1'>
                        <label className=' block font-bold'>
                          Reminder DateTime:
                        </label>
                      </div> */}
                      <div className='z-40 col-span-1 grid-cols-2 '>
                        <DatepickerComponent
                          showTimeSelect
                          minDate={new Date()}
                          maxTime={new Date().setHours(23, 59, 59, 999)}
                          minTime={new Date()}
                          selectedDate={selectedDate}
                          onChange={(date) => {
                            setSelectedDate(date || new Date());
                            setErrors((prev) => ({
                              ...prev,
                              reminderDateTime: '',
                            }));
                          }}
                          dateFormat='dd/MM/yyyy h:mm aa'
                          error={errors?.reminderDateTime}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
{/* 
            <div className='grid grid-cols-3 gap-4'>
              <div className='col-start-2'>
                <Button
                  size={'xs'}
                  onClick={onSaveClick}
                  disabled={isLoading}
                  icon={isLoading ? <IconLoading /> : null}
                >
                  Save
                </Button>
              </div>
            </div> */}
          </div>
          <TableComponent columns={columnsData} data={notes} />
        </div>
      </ScrollArea>
    </MyDialog>
  );
};

export default AddNote;
