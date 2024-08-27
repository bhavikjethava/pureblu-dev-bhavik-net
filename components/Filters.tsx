import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import CheckboxItem from './CheckboxItem';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import DatepickerComponent from './DatePicker';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { ScrollArea } from './ui/scroll-area';
import moment from 'moment';

interface FormData {
  [key: string]: any;
}

const Filters = ({
  updateComplaintListByCity,
  handleFilterClick,
  complaintList,
  complaintType,
  onChecked,
  selectAllChecked,
  onSelectAllChange,
}: any) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [errors, setErrors] = useState<FormData>();
  const [cities, setCities] = useState<any[]>([
    { id: 'all', name: 'Select All', isChecked: true }, // Added Select All with isChecked true
  ]);
  const apiAction = useMutation(apiCall);

  const handleDateChange = (newDate: any, dateType: string) => {
    setErrors({});
    if (dateType === 'start') {
      setStartDate(newDate);
    } else if (dateType === 'end') {
      setEndDate(newDate);
    }
  };

  const onFilterClick = () => {
    // Validation: Check if end date is greater than or equal to start date
    if (moment(startDate).format('yyyy-MM-DD') > moment(endDate).format('yyyy-MM-DD')) {
      setErrors({ endDate: 'End date cannot be earlier than start date' });
      return;
    }

    // Proceed with filtering if validation passes
    setErrors({});
    handleFilterClick(startDate, endDate, cities);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const fetchComplaints = {
        endpoint: `${API_ENDPOINTS_PARTNER.HELPER_API}/city`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchComplaints);

      // Prepend Select All option to the fetched cities
      const updatedCities = [
        { id: 'all', name: 'Select All', isChecked: true },
        ...data.map((city: any) => ({ ...city, isChecked: true })),
      ];

      setCities(updatedCities);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onServiceChecked = (index: any, checked: boolean) => {
    onChecked(index, checked);
  };

  const onCityChecked = (index: number, checked: boolean) => {
    if (cities[index].id === 'all') {
      // Handle Select All checkbox
      const updatedCities = cities.map((city) => ({
        ...city,
        isChecked: checked,
      }));
      setCities(updatedCities);
      updateComplaintListByCity(updatedCities); // Update complaint list based on selected cities
    } else {
      // Handle individual city checkboxes
      const updatedCities = [...cities];
      updatedCities[index] = { ...updatedCities[index], isChecked: checked };
      setCities(updatedCities);
      updateComplaintListByCity(updatedCities); // Update complaint list based on selected cities
    }
  };

  return (
    <div className='h-full w-full flex-none rounded-sm bg-white py-10 text-base shadow-2xl md:w-[300px]'>
      <div className='px-5'>
        <h2 className='mb-5'>Filter Record By :-</h2>
      </div>
      <div className='flex h-full flex-col overflow-auto'>
        <ScrollArea className='grow'>
          <Accordion type='single' collapsible className='w-full px-5'>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='hover:no-underline'>
                City
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-5 py-4'>
                  {cities.map((city, index) => (
                    <CheckboxItem
                      key={city.id}
                      ariaLabel={city.name}
                      id={city.id}
                      checked={city.isChecked}
                      onCheckedChange={(checked) =>
                        onCityChecked(index, checked)
                      }
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger className='hover:no-underline'>
                Date Range
              </AccordionTrigger>
              <AccordionContent>
                <div className='flex flex-col space-y-5'>
                  <DatepickerComponent
                    className=''
                    dateFormat='dd MMM, yyyy'
                    onChange={(newDate) => handleDateChange(newDate, 'start')}
                    selectedDate={startDate}
                  />
                  <DatepickerComponent
                    className=''
                    dateFormat='dd MMM, yyyy'
                    onChange={(newDate) => handleDateChange(newDate, 'end')}
                    selectedDate={endDate}
                  />
                  {errors?.endDate && (
                    <div className='text-xs text-pbHeaderRed'>
                      {errors.endDate}
                    </div>
                  )}{' '}
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    onClick={onFilterClick}
                  >
                    Filter
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            {/* <AccordionItem value='item-3'>
          <AccordionTrigger className='hover:no-underline'>
            Partner Type
          </AccordionTrigger>
          <AccordionContent>
            <div className='space-y-5 py-4'>
              <CheckboxItem ariaLabel=' Freemium' id=' Freemium' />
              <CheckboxItem ariaLabel=' Premium' id=' Premium' />
              <CheckboxItem ariaLabel=' Certified' id=' Certified' />
            </div>
          </AccordionContent>
        </AccordionItem> */}
            <AccordionItem value='item-4'>
              <AccordionTrigger className='hover:no-underline'>
                Complaint Type
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-5 py-4'>
                  <CheckboxItem
                    ariaLabel='Select All'
                    id='Select All'
                    checked={selectAllChecked}
                    onCheckedChange={(checked) => onSelectAllChange(checked)}
                  />
                  {complaintType &&
                    complaintType?.map((item: any, index: number) => (
                      <CheckboxItem
                        key={index}
                        ariaLabel={item.name}
                        id={item.name}
                        checked={item.isChecked}
                        onCheckedChange={(checked) =>
                          onServiceChecked(index, checked)
                        }
                      />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Filters;
