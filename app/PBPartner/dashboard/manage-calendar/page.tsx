'use client';
import Breadcrumb from '@/components/Breadcrumb';
import SelectBox from '@/components/SelectBox';
import { Button } from '@/components/ui/button';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { useEffect, useState } from 'react';
import { EventInput } from '@fullcalendar/core';
import AddNewComplaint from '@/components/ManageCalendar/AddNewComplaint';
import moment from 'moment';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import { API_ENDPOINTS_PARTNER, PARTNER_ } from '@/utils/apiConfig';
import CustomFullCalendar from '@/components/ManageCalendar/CustomFullCalendar';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import { showToast } from '@/components/Toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import MultiSelectDropdown from '@/components/MultiSelect';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/Loader';
import StatusButtonGroup from '@/components/ManageCalendar/StatusButtonGroup';

const ManageCalendar = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [modalInfo, setModalInfo] = useState<any>({});
  const apiAction = useMutation(apiCall);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedDateInfo, setSelectedDateInfo] = useState<any>({});
  const [isConfirmation, setConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>({});
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  const [isEdit, setisEdit] = useState(false);
  const [technicianList, setTechnicianList] = useState<any>([]);

  const [isLoading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    allocatingTechnician: 0,
    upcoming: 0,
    ongoing: 0,
    past: 0,
  });

  useEffect(() => {
    fetchTechnician();
  }, []);

  // const { technicianList, updateTechnicianList, activeTechnician } =
  //   useFetchTechnician(API_ENDPOINTS_PARTNER);

  const fetchTechnician = async () => {
    try {
      let endpoint = `${API_ENDPOINTS_PARTNER.TECHNICIAN}?is_active=1&need_all=1`;
      const getdata = {
        endpoint,
        method: 'GET',
      };
      setTechnicianList(undefined);

      const { data } = await apiAction.mutateAsync(getdata);
      setTechnicianList(data.technician);
    } catch (error) {
      console.error('Failed to fetch technician:', error);
    }
  };

  const transformedTechnicianList = [
    { id: '-1', title: 'Unassigned', phone: '' },
    ...(technicianList || [])?.map((technician: any) => ({
      id: technician?.id,
      title: technician?.name,
      phone: technician?.phone,
    })),
  ];

  const filteredTechnicianList = selectedTechnicians.length
    ? transformedTechnicianList.filter((tech) =>
        selectedTechnicians.some(
          (selectedTech: any) => selectedTech.id === tech.id
        )
      )
    : transformedTechnicianList;

  const dropdownTechnicianList = [
    // { id: 'all', name: 'Select All Technicians' },
    ...(technicianList || []),
  ];

  useEffect(() => {
    if (selectedDateInfo.start) {
      fetchRequest();
    }
  }, [selectedDateInfo]);

  const fetchRequest = async () => {
    setLoading(true);

    const today = moment(selectedDateInfo?.start).format('YYYY-MM-DD');

    const getPartner = {
      endpoint: `${PARTNER_}calendar-request?request_date=${today}`,
      method: 'GET',
    };
    const { data: allRequest } = await apiAction.mutateAsync(getPartner);
    const transformedEvents = transformResponseData(allRequest);
    setEvents(transformedEvents);

    // Count items by name
    const newCounts = {
      allocatingTechnician: 0,
      upcoming: 0,
      ongoing: 0,
      past: 0,
    };

    allRequest.forEach((item: any) => {
      if (item.name === 'Allocating Technician') {
        newCounts.allocatingTechnician += item.request.length;
      } else if (item.name === 'Upcoming') {
        newCounts.upcoming += item.request.length;
      } else if (item.name === 'Ongoing') {
        newCounts.ongoing += item.request.length;
      } else {
        newCounts.past += item.request.length;
      }
    });

    setCounts(newCounts);
    setLoading(false);
  };

  function transformResponseData(response: any[]): any[] {
    return response.flatMap((item) =>
      item.request.map((req: any) => {
        // Get the current date
        const currentDate = moment(selectedDateInfo?.start).format(
          'YYYY-MM-DD'
        );

        // Get the assign date
        const assignDate = req.request_technician.assign_date;

        // Parse the assign date and add one hour
        const endTimeMoment = moment(assignDate).add(1, 'hours');

        // Format the end time to match the start time format
        const formattedStartDate = moment(assignDate).format(
          'YYYY-MM-DDTHH:mm:ss'
        );
        const formattedEndDate = endTimeMoment.format('YYYY-MM-DDTHH:mm:ss');

        // Determine the background color based on the request status
        let backgroundColor;
        if (item.name === 'Allocating Technician') {
          backgroundColor = '#f0ad4e';
        } else if (item.name === 'Upcoming') {
          backgroundColor = 'green';
        } else if (item.name === 'Ongoing') {
          backgroundColor = '#337ab7';
        } else {
          backgroundColor = 'gray'; // Default
        }

        const resourceId = req.request_technician.technician_id || '-1';

        return {
          id: req.id,
          resourceId: resourceId,
          title: req.request_technician.assign_date,
          start: formattedStartDate,
          end: formattedEndDate,
          backgroundColor: backgroundColor,
          borderColor: backgroundColor,
          extendedProps: {
            ...req,
            customerId: req.customer.id,
            customerName: req.customer.name,
            customer: req.customer,
          },
        };
      })
    );
  }

  const handleEventDrop = (info: any) => {
    const { event, newResource } = info;
    let valid = false;
    let msg = '';

    const eventStart = moment(event.start);

    const currentDate = moment();
    const currentTime = moment();

    if (newResource === null) {
      if (isDateValid(eventStart, currentDate, currentTime)) {
        if (info?.event?.extendedProps?.request_technician.technician?.id) {
          const assignDate = eventStart.format('Y-MM-DD H:mm');
          setSelectedEvent({
            id: event.id,
            message: `Do you want to assign Complaint Id: ${event.id}${msg}?`,
            info: info,
            assignDate: assignDate,
          });
          valid = true;
        } else {
          valid = false;
          showToast({
            variant: 'destructive',
            message: 'Please choose a Tecnician',
          });
        }
      }
    } else {
      if (isDateValid(eventStart, currentDate, currentTime)) {
        if (
          info.newResource._resource.id != -1 &&
          info.newResource._resource.id > 0
        ) {
          const assignDate = eventStart.format('Y-MM-DD H:mm');
          msg = ` to ${newResource._resource.title}`;
          valid = true;
          setSelectedEvent({
            id: event.id,
            message: `Do you want to assign Complaint Id: ${event.id}${msg}?`,
            info: info,
            assignDate: assignDate,
          });
        } else {
          valid = false;
          showToast({
            variant: 'destructive',
            message: 'Please choose a Tecnician:',
          });
        }
      }
    }

    if (valid) {
      setConfirmation(true);
    } else {
      info.revert();
    }
  };

  const onCloseConfram = () => {
    setConfirmation(false);
    selectedEvent.info.revert();
    setSelectedEvent({});
  };

  const handleDateClick = (info: any) => {
    const selectedDate = moment(info.dateStr); // Convert the clicked date to a Moment object
    const currentDate = moment(); // Get the current date
    const currentTime = moment();

    if (isDateValid(selectedDate, currentDate, currentTime)) {
      setModalInfo(info); // Set modalInfo state with the necessary information
      setOpenDialog(true); // Set openDialog state to true to open the
    }
  };

  const isDateValid = (
    selectedDate: moment.Moment,
    currentDate: moment.Moment,
    currentTime: moment.Moment
  ): boolean => {
    if (selectedDate.isSame(currentDate, 'day')) {
      if (selectedDate.isAfter(currentTime)) {
        return true;
      } else {
        showToast({
          variant: 'destructive',
          message: 'Please choose a time in the future',
        });
        return false;
      }
    } else if (selectedDate.isAfter(currentDate)) {
      return true;
    } else {
      showToast({
        variant: 'destructive',
        message: 'Please choose a date in the future',
      });
      return false;
    }
  };

  const handleSave = async () => {
    // setLoading(true);
    try {
      let params = {
        assign_date: selectedEvent.assignDate,
        request_ids: [selectedEvent.id],
        technician_ids: selectedEvent.info.newResource
          ? [selectedEvent.info.newResource.id]
          : [
              selectedEvent.info?.event?.extendedProps?.request_technician
                .technician?.id,
            ],
      } as any;
      let apiUrl = `${API_ENDPOINTS_PARTNER.ASSIGN_TECHNICIAN}?_method=patch`;
      const technician = {
        endpoint: apiUrl,
        method: 'POST',
        body: params,
      };

      const { data } = await apiAction.mutateAsync(technician);
      if (data) {
        fetchRequest();
        setConfirmation(false);
        setSelectedEvent({});
      }
    } catch (error: any) {
      console.log(error, 'params');

      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDatesSet = (dateInfo: any) => {
    setSelectedDateInfo(dateInfo);
  };

  const handleIconClick = (info: any) => {
    setisEdit(true);
    setModalInfo(info);
    setOpenDialog(true);
  };

  return (
    <div className='p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5 '>
        <Breadcrumb />
        <div className='relative z-0 flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-center'>
          <div className='w-full max-w-sm  flex-1'>
            <MultiSelectDropdown
              options={dropdownTechnicianList}
              label=''
              getOptionValue={(option) => option?.id} // Pass getOptionValue function
              getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
              onChange={(selectedValues: any) =>
                setSelectedTechnicians(selectedValues)
              }
            />
          </div>
          <StatusButtonGroup counts={counts} />
        </div>

        <CustomFullCalendar
          resources={filteredTechnicianList}
          events={events}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
          onDatesSet={handleDatesSet} // Pass the callback to CustomFullCalendar
          resourceAreaHeaderContent='Technician List' // Pass the prop here
          onIconClick={handleIconClick}
        />

        <ConfirmationDialog
          isOpen={isConfirmation}
          onClose={() => {
            onCloseConfram();
          }}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: handleSave,
              icon: isLoading ? <IconLoading /> : '',
              btnLoading: isLoading,
            },
          ]}
          ClassName='sm:max-w-lg'
        >
          <h2 className='mb-5 text-2xl'>Are you sure?</h2>
          {selectedEvent && selectedEvent.message}
        </ConfirmationDialog>

        {openDialog && (
          <AddNewComplaint
            open={openDialog}
            onClose={() => {
              setOpenDialog(false);
              setisEdit(false);
            }}
            info={modalInfo}
            fetchRequest={fetchRequest}
            isEdit={isEdit}
            technicianList={technicianList}
            apiBaseUrl={API_ENDPOINTS_PARTNER}
          />
        )}
      </div>
      {isLoading ? <Loader /> : null}
    </div>
  );
};

export default ManageCalendar;
