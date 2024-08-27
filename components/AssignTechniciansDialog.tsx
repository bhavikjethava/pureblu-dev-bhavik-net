import React, { useContext, useEffect, useState } from 'react';
import MyDialog from './MyDialog';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import SearchInput from './SearchInput';
import SelectBox from './SelectBox';
import DatepickerComponent from './DatePicker';
import TableComponent from './Table';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ROUTES, {
  OptionType,
  REFRESHCOMPLAINTLIST,
  SKILLLIST,
  getBaseUrl,
} from '@/utils/utils';
import CheckboxItem from './CheckboxItem';
import { isRequired } from '@/utils/ValidationUtils';
import { DataContext } from '@/context/dataProvider';
import { showToast } from './Toast';
import { validateForm } from '@/utils/FormValidationRules';
import moment from 'moment';
import { PARTNER_ } from '@/utils/apiConfig';
import { usePathname } from 'next/navigation';
import ManageCalendar from './ManageCalendar/ManageCalendar';

interface FormData {
  [key: string]: any;
}

interface TechnicianColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const AssignTechniciansDialog = ({
  apiBaseUrl,
  open,
  onClose,
  selectedComplaint,
  selectedComplaintIds,
  preventiveServices,
}: any) => {
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;
  const isPartner = basePath == ROUTES.PBPARTNER;

  const apiAction = useMutation(apiCall);
  const [selectedTechnician, setselectedTechnician] = useState<FormData>({
    assign_date: moment().add(30, 'minutes').toDate(),
  });
  const [selectedSkill, setSelectedSkill] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [skillList, setSkillList] = useState<Array<OptionType>>([]);
  const [errors, setErrors] = useState<FormData>();
  const { state, setData } = useContext(DataContext);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>(
    []
  );
  const [filteredTechnicianData, setfilteredTechnicianData] =
    useState<FormData>();
  const [openDialog, setOpenDialog] = useState(false);
  const [technicianList, setTechnicianList] = useState<any>([]);

  useEffect(() => {
    fetchTechnician();
  }, []);

  useEffect(() => {
    let tempSkillList: Array<OptionType> = [];
    if (state?.[SKILLLIST]) tempSkillList = [...state?.[SKILLLIST]];
    tempSkillList.unshift({ id: -1, name: 'Skill type' });
    setSkillList(tempSkillList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[SKILLLIST]]);

  useEffect(() => {
    // Filter data based on the search term
    const filteredTechnicianData = technicianList?.filter((item: any) => {
      const searchMatch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let excludeItemById = true;
      if (selectedComplaint?.isAssistant) {
        excludeItemById =
          item.id !== selectedComplaint?.request_technician?.technician?.id;
      }
      if (selectedSkill == -1) {
        return searchMatch && excludeItemById;
      } else {
        const skillMatch = item.skills.some(
          (skill: any) => skill.skill_id === selectedSkill
        );
        return searchMatch && skillMatch && excludeItemById;
      }
    });

    setfilteredTechnicianData(filteredTechnicianData);
  }, [searchTerm, technicianList, selectedSkill]); // Add searchTerm and itemList as dependencies

  const fetchTechnician = async () => {
    try {
      let url = `${apiBaseUrl.TECHNICIAN}?need_all=1&need_skill=1&is_active=1`;
      if (!isPartner) {
        url += `&partner_id=${selectedComplaint?.device?.device_assign_partner?.partner_id}`;
      }
      const getdata = {
        endpoint: `${url}`,
        method: 'GET',
      };
      setTechnicianList(undefined);
      const { data } = await apiAction.mutateAsync(getdata);
      setTechnicianList(data.technician);
    } catch (error) {
      console.error('Failed to fetch technician:', error);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setselectedTechnician((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    if (isRequired(value)) {
      setErrors((prevError) => {
        return {
          ...prevError,
          [key]: '',
        };
      });
    }
  };

  const handleTechnicianSelect = (technicianId: string) => {
    // Check if the technician ID is already selected
    const index = selectedTechnicianIds.indexOf(technicianId);
    if (index !== -1) {
      // Technician is already selected, remove from the array
      setSelectedTechnicianIds((prevIds) =>
        prevIds.filter((id) => id !== technicianId)
      );
    } else {
      // Technician is not selected, add to the array
      setSelectedTechnicianIds((prevIds) => [...prevIds, technicianId]);
    }
    if (isRequired(technicianId)) {
      setErrors((prevError) => {
        return {
          ...prevError,
          technician_ids: '',
        };
      });
    }
  };

  const handleSave = async () => {
    try {
      // Start the loading state
      setLoading(true);
      const valifationRules = [
        {
          field: 'technician_ids',
          value: selectedTechnicianIds.join(','),
          customMessage: 'Please select Technician',
        },
      ];

      let { isError, errors } = validateForm(valifationRules);
      let assignDate = moment(selectedTechnician?.assign_date || new Date());

      let params = {
        assign_date: assignDate.format('YYYY-MM-DD HH:mm'), // Format with added 30 minutes
        technician_ids: selectedTechnicianIds,
      } as any;

      if (preventiveServices) {
        params.amc_service_ids = selectedComplaintIds; // Assuming you have selectedAmcServiceIds defined
      } else {
        params.request_ids = selectedComplaintIds;
      }

      if (isPBEnterprise) {
        params.partner_id = selectedComplaint?.customer?.partner_id;
      }

      if (isError) {
        setErrors(errors);
      } else {
        let apiUrl = apiBaseUrl.CUSTOMERS;

        const technician = {
          endpoint: apiUrl,
          method: 'POST',
          body: params,
        };

        technician.endpoint = `${apiBaseUrl.ASSIGN_TECHNICIAN}?_method=patch`;

        if (preventiveServices) {
          technician.endpoint = `${PARTNER_}preventive-services/request`;
        }

        if (selectedComplaint?.isAssistant) {
          technician.endpoint = `${apiUrl}/${selectedComplaint.customer_id}/request/${selectedComplaint?.id}/assign-technician?_method=patch`;
          technician.body = {
            technician_ids: selectedTechnicianIds,
          };
        }
        const response = await apiAction.mutateAsync(technician);

        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setselectedTechnician({});
          onClose();
          setData({ [REFRESHCOMPLAINTLIST]: new Date().toISOString() });
        }
      }
    } catch (error: any) {
      // Show an alert with the error message
      showToast({
        variant: 'destructive',
        message: error.message,
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } finally {
      // Stop the loading state regardless of success or failure
      setLoading(false);
    }
  };

  const columns: TechnicianColumn[] = [
    {
      accessorKey: 'button',
      header: '',
      className: 'max-w-[40px]',
      render: (item: any, index: number) => (
        <CheckboxItem
          key={item.id}
          checked={selectedTechnicianIds.includes(item.id)}
          onCheckedChange={() => handleTechnicianSelect(item.id)}
          ariaLabel={''}
          id={`tech_${item.id}`}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      render: (item: any) => <span className='font-bold'>{item?.name}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      render: (item: any) => <span className='font-bold'>{item?.phone}</span>,
    },
  ];

  const buttons: any[] = [
    {
      text: 'Assign',
      variant: 'blue',
      size: 'sm',
      onClick: () => handleSave(),
      btnLoading: loading,
      icon: loading ? <IconLoading /> : '',
    },
  ];

  if (isPBEnterprise) {
    buttons.unshift({
      text: 'Calendar',
      variant: 'blue',
      size: 'sm',
      onClick: () => setOpenDialog(true),
      className: 'mr-auto',
    });
  }
  const selectedDateWithOffset = selectedTechnician?.assign_date;
  // ? moment(selectedTechnician.assign_date).add(30, 'minutes').toDate()
  // : moment().add(30, 'minutes').toDate();

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title={
        selectedComplaint?.isAssistant
          ? 'Assign Assistant'
          : 'Assign Technicians'
      }
      buttons={buttons}
    >
      <div className='flex h-96 flex-col p-4'>
        <div className='grid grid-cols-2 gap-3 pb-3'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search'
          />
          <SelectBox
            label=''
            options={skillList}
            value={selectedSkill}
            onChange={setSelectedSkill}
          />
        </div>
        {!selectedComplaint?.isAssistant && (
          <div className='pb-3'>
            <DatepickerComponent
              showTimeSelect
              className='grid grid-cols-2 items-center gap-3'
              label='Assign Date'
              minDate={new Date()}
              dateFormat='dd/MM/yyyy hh:mm a'
              onChange={(e) => handleInputChange('assign_date', e)}
              selectedDate={selectedDateWithOffset}
              error={errors?.assign_date || ''}
            />
          </div>
        )}
        {/* {filteredTechnicianData && ( */}
        <TableComponent columns={columns} data={filteredTechnicianData} />
        {/* )} */}
        {errors?.technician_ids && (
          <div className='mt-1 text-xs text-pbHeaderRed'>
            {errors.technician_ids}
          </div>
        )}{' '}
      </div>

      {openDialog && (
        <ManageCalendar
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
          }}
        />
      )}
    </MyDialog>
  );
};

export default AssignTechniciansDialog;
