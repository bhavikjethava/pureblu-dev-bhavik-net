import CheckboxItem from '@/components/CheckboxItem';
import MyDialog from '@/components/MyDialog';
import TableComponent from '@/components/Table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DataContext } from '@/context/dataProvider';
import { apiCall } from '@/hooks/api';
import { validateForm } from '@/utils/FormValidationRules';
import { IconCalendarDays, IconLoading } from '@/utils/Icons';
import { ERROR_MESSAGES } from '@/utils/ValidationUtils';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { format } from 'date-fns';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  onPause?: (newData: any) => void;
  isLoading: boolean;
  id: string;
}

interface FormData {
  [key: string]: string;
}

const columnsData = [
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    render: (item: any) => (
      <span>{format(item?.start_date || '', 'yyyy-MM-dd')}</span>
    ),
  },
  {
    accessorKey: 'end_date',
    header: 'End Date',
    render: (item: any) => (
      <span>{format(item?.end_date || '', 'yyyy-MM-dd')}</span>
    ),
  },
  // {
  //   accessorKey: 'reason',
  //   header: 'Reason to Pause',
  //   render: (item: any) => <span>{item?.pause_reason?.name}</span>,
  // },
];

const PauseDialog: FC<DialogProps> = ({
  open,
  onClose,
  onPause,
  id,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    sDate: new Date(),
    eDate: new Date(),
    selectedReason: '',
  });
  const [indefinite, setIndefinite] = useState(false);
  const [history, setHistory] = useState();
  const [errors, setErrors] = useState<FormData>({});
  const apiAction = useMutation(apiCall);
  const { state } = useContext(DataContext);

  useEffect(() => {
    fetchPauseHistory();
  }, [id]);

  const fetchPauseHistory = async () => {
    try {
      const data = {
        endpoint: `${API_ENDPOINTS.PARTNER}/${id}/pause-history`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setHistory(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onPauseHandle = () => {
    const { sDate, eDate, selectedReason } = formData;
    const valifationRules = [
      { field: 'sDate', value: sDate?.toString() || '', message: 'Start date' },
      {
        field: 'eDate',
        value: eDate?.toDateString() || '',
        message: 'End date',
      },
      // {
      //   field: 'selectedReason',
      //   value: selectedReason || '',
      //   customMessage: 'Please select Reason to Pause',
      // },
    ];
    let { isError, errors } = validateForm(valifationRules);
    if (sDate > eDate) {
      isError = true;
      errors['eDate'] = 'Select proper end date';
    }
    if (isError) {
      setErrors(errors);
    } else {
      if (onPause) {
        let param: any = {
          action: 'pause',
          start_date: format(sDate || '', 'yyyy-MM-dd'),
          end_date: format(eDate || '', 'yyyy-MM-dd'),
          is_idefinite: indefinite ? 1 : 2,
        };
        if (selectedReason) {
          param['pause_reason_id'] = selectedReason;
        }
        onPause(param);
      }
    }
  };

  const onChangeHandle = (field: string, value: string | Date | undefined) => {
    setErrors((prev) => {
      return {
        ...prev,
        [field]: '',
      };
    });
    setFormData((prev) => {
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Pause Partner'
      ClassName='max-h-[90%]'
    >
      <div className='grid grid-cols-2 gap-4 p-4'>
        <div>
          <label className='mb-2 block font-bold'>Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={`gap-x-4 font-normal
              ${!formData?.sDate && 'text-muted-foreground'}`}
              >
                {formData?.sDate ? (
                  format(formData?.sDate, 'yyyy-MM-dd')
                ) : (
                  <span>Pick a date</span>
                )}
                <IconCalendarDays className='h-4 w-4 justify-end' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={formData?.sDate}
                onSelect={(date) => onChangeHandle('sDate', date)}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors?.sDate ? (
            <div className='mt-1 text-xs text-pbHeaderRed'>{errors?.sDate}</div>
          ) : null}
        </div>
        <div className='justify-end'>
          <label className='mb-2 block font-bold'>End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={`gap-x-4  font-normal
              ${!formData?.eDate && 'text-muted-foreground'}`}
              >
                {formData?.eDate ? (
                  format(formData?.eDate, 'yyyy-MM-dd')
                ) : (
                  <span>Pick a date</span>
                )}
                <IconCalendarDays className=' h-4 w-4 justify-end' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={formData?.eDate}
                onSelect={(date) => onChangeHandle('eDate', date)}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors?.eDate ? (
            <div className='mt-1 text-xs text-pbHeaderRed'>{errors?.eDate}</div>
          ) : null}
        </div>
      </div>
      {/* <div className='px-4'>
        <CheckboxItem
          key='Indefinite'
          checked={indefinite} // Check if the current brand id is in the selectedBrandIds array
          onCheckedChange={(checked) => setIndefinite(checked)}
          ariaLabel='indefinite'
          id={`indefinite`}
        />
      </div>
      <div className='px-4 py-5'>
        <label className='mb-2 block text-lg font-bold '>Reason</label>
        <div>
          <RadioGroup
            defaultValue='option-one'
            className='mt-4 grid grid-cols-3 gap-4'
            value={formData?.selectedReason}
            onValueChange={(checked) =>
              onChangeHandle('selectedReason', checked)
            }
          >
            {state?.helpers?.technician_pause_reason?.map((reason: any) => (
              <div className='flex items-center space-x-2' key={reason.id}>
                <RadioGroupItem value={reason.id} id={reason.id} />
                <label
                  htmlFor={reason.id}
                  className='text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {reason.name}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
        {errors?.selectedReason ? (
          <div className='mt-1 text-xs text-pbHeaderRed'>
            {errors?.selectedReason}
          </div>
        ) : null}
      </div> */}
      <div className='flex justify-end px-4'>
        <Button
          className=''
          variant={'blue'}
          onClick={onPauseHandle}
          disabled={isLoading}
          icon={isLoading ? <IconLoading /> : null}
        >
          Pause
        </Button>
      </div>
      <div className='px-4 pt-5'>
        <label className='mb-2 block border-t border-black pt-5 text-lg font-bold'>
          Previous
        </label>
        <div className='flex h-72 max-h-[180px] flex-col'>
          <TableComponent columns={columnsData} data={history} />
        </div>
      </div>
    </MyDialog>
  );
};

export default PauseDialog;
