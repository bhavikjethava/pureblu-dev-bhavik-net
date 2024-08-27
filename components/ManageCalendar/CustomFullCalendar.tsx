// CustomFullCalendar.tsx
import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { EventInput } from '@fullcalendar/core';
import moment from 'moment';
import { IconCalendarDays } from '@/utils/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface Props {
  resources: any[];
  events: EventInput[];
  onDateClick: (info: any) => void;
  onEventDrop: (info: any) => void;
  onDatesSet: (dateInfo: any) => void;
  resourceAreaHeaderContent: string;
  onIconClick: (event: EventInput) => void;
}

const CustomFullCalendar: React.FC<Props> = ({
  resources,
  events,
  onDateClick,
  onEventDrop,
  onDatesSet,
  resourceAreaHeaderContent,
  onIconClick,
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleDateChange = (date: any) => {
    setOpen(false);
    setSelectedDate(date);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  };

  const scrollTimeToday = () => {
    const today = new Date();
    return today.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderEventContent = (info: any) => {
    const expro = info.event.extendedProps;
    const time = moment(info.event.title);
    // Format the time as "hh:mm A" (12-hour clock with AM/PM)
    const formattedTime = time.format('hh:mm A');
    const dec = `<span style="cursor: pointer;" class="glyphicon glyphicon-calendar edit_modal" data-cutomer-name="${expro.customerName}" data-comp-id="${expro.id}" data-time="${formattedTime}"></span>`;
    return (
      <div className='group relative'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className='flex w-full flex-col'>
              <div className='w-full cursor-grab'>
                <div className='flex justify-between'>
                  <span className=''>{formattedTime}</span>
                  <span className=''>
                    <button
                      onClick={() => onIconClick(info)}
                      className='ml-2 p-1 '
                    >
                      <IconCalendarDays />
                    </button>
                  </span>
                </div>
                <div className='w-full capitalize flex justify-start font-bold'>
                  {expro.customerName}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent arrowPadding={1} className='rounded-lg border border-gray-200 bg-white p-0 mb-3 max-w-80 w-full'>
              <div className=''>
                <div className='rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2'>
                  <h3 className='font-semibold '>{formattedTime}</h3>
                </div>
                <div className='p-4'>
                  <div>
                    <strong>Id: </strong>
                    {expro.id}
                  </div>
                  <div>
                    <strong>Name: </strong>
                    {expro.customerName}
                  </div>
                  <div>
                    <strong>Address: </strong>
                    {[
                      expro?.device?.branch?.address_1,
                      expro?.device?.branch?.address_2,
                      expro?.device?.branch?.address_3,
                      expro?.device?.branch?.city?.name,
                      expro?.device?.branch?.state?.name,
                      expro?.device?.branch?.zip,
                    ]
                      .filter(Boolean) // Remove any undefined or empty parts
                      .join(', ')}
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <div className='relative'>
      <div className='absolute right-[70px]'>
        <div className='relative'>
          <Button
            variant={'outline'}
            onClick={handleToggle}
            className='flex  items-center !p-2.5 text-primary'
          >
            <CalendarIcon className='h-4 w-4' />
          </Button>
          {open && (
            <div className='absolute right-0 top-full z-30 overflow-hidden rounded-md border bg-white shadow-lg'>
              <Calendar
                onChange={(e: any) => handleDateChange(e)}
                value={selectedDate}
              />
            </div>
          )}
        </div>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          resourceTimelinePlugin,
        ]}
        resources={resources}
        events={events}
        resourceLabelContent={(renderInfo: any) => {
          const technician = renderInfo.resource;
          return {
            html: `<div><p><strong>${technician.title}</strong></p><p>${technician.extendedProps.phone}</p></div>`,
          };
        }}
        resourceAreaHeaderContent={resourceAreaHeaderContent} // Use the prop here
        initialView='resourceTimeline'
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        dateClick={onDateClick}
        displayEventTime={false}
        eventContent={renderEventContent}
        resourceAreaWidth='300px'
        slotMinTime='08:00'
        slotMaxTime='23:00'
        aspectRatio={1.5}
        editable={true}
        droppable={true}
        resourceOrder='id,title'
        slotDuration='00:05:00'
        selectable={true}
        scrollTime={scrollTimeToday()}
        eventDrop={onEventDrop}
        datesSet={(dateInfo) => {
          onDatesSet(dateInfo); // Call the parent callback with dateInfo
        }}
      />
    </div>
  );
};

export default CustomFullCalendar;
