import React, { useContext, useEffect, useState } from 'react';
import MyDialog from './MyDialog';
import SelectBox from './SelectBox';
import { IconLoading } from '@/utils/Icons';
import {
  COMPLAIN_STATUS,
  OptionType,
  REFRESHCOMPLAINTLIST,
  STATUSLIST,
} from '@/utils/utils';
import { apiCall } from '@/hooks/api';
import { useMutation } from 'react-query';
import { DataContext } from '@/context/dataProvider';
import { validateForm } from '@/utils/FormValidationRules';

interface FormData {
  [key: string]: any;
}

const ComplainStatusChangeDialog = ({
  apiBaseUrl,
  open,
  onClose,
  selectedComplaint,
}: any) => {
  const apiAction = useMutation(apiCall);
  const [errors, setErrors] = useState<FormData>();
  const [formData, setFormData] = useState({
    request_status_id: selectedComplaint?.request_status_id,
  });
  const [isStatusLoading, setStatusLoading] = useState(false);
  const { state, setData } = useContext(DataContext);
  const [statusDropdownList, setStatusDropdownList] = useState(
    state?.[STATUSLIST] || []
  );

  useEffect(() => {
    if (open && !state[STATUSLIST]) {
      fetchStatus();
    } else {
      const tempStatus = filterStatus(state?.[STATUSLIST]);
      setStatusDropdownList(tempStatus);
    }
  }, [open]); // Only runs when 'open' prop changes

  const fetchStatus = async () => {
    try {
      const fetchStatus = {
        endpoint: `${apiBaseUrl.REQUESTSTATUS}?need_all=1`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchStatus);
      if (data) {
        setData({ [STATUSLIST]: data });
        const tempStatus = filterStatus(data);
        setStatusDropdownList(tempStatus);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  // client side validation if technician assign then restict to open if not assign then only open status will be selected
  const filterStatus = (statusList: any) => {
    const { request_technician, request_status_id } = selectedComplaint || {};
    const technicianAssigned = request_technician?.technician !== null;
    const isClosed = request_status_id === COMPLAIN_STATUS.CLOSED;
    const isResolved = request_status_id === COMPLAIN_STATUS.RESOLVED;

    return statusList.map((x: any) => {
      const isDisabled = (
        (technicianAssigned && x.id === COMPLAIN_STATUS.OPEN) ||
        (!technicianAssigned && x.id !== COMPLAIN_STATUS.OPEN && !isClosed && !isResolved) 
        // || (!technicianAssigned && (isClosed || isResolved) && x.id !== COMPLAIN_STATUS.REOPENED && x.id !== COMPLAIN_STATUS.OPEN)
      );
      
      return { ...x, disabled: isDisabled };
    });
  };

  const onChangeHandler = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const onSaveStatus = async () => {
    try {
      const { request_status_id } = formData;
      const valifationRules = [
        {
          field: 'request_status_id',
          value: request_status_id || '',
          customMessage: 'Please select status',
        },
      ];
      let { isError: validationIsError, errors: validationError } =
        validateForm(valifationRules);
      if (validationIsError) {
        setErrors(validationError as any);
        // return;
      }
      setStatusLoading(true);
      let body = {
        request_status_id,
      };

      const updateComplaints = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedComplaint.customer_id}/request/${selectedComplaint?.id}/change-status`,
        method: 'PATCH',
        body,
      };

      const { data, isError, errors } =
        await apiAction.mutateAsync(updateComplaints);
      if (!isError) {
        setData({ [REFRESHCOMPLAINTLIST]: !state?.[REFRESHCOMPLAINTLIST] });
        // setComplainList(updateArray(complaintList, data));
        onClose();
      } else {
        setErrors(errors);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Update complaint status'
      buttons={[
        {
          text: 'Save',
          variant: 'blue',
          size: 'sm',
          onClick: onSaveStatus,
          btnLoading: isStatusLoading,
          icon: isStatusLoading ? <IconLoading /> : null,
        },
      ]}
    >
      <div className='flex grow flex-col gap-4 overflow-auto p-4'>
        <SelectBox
          label=''
          options={statusDropdownList}
          value={formData.request_status_id}
          onChange={(e) => onChangeHandler('request_status_id', e)}
          error={errors?.request_status_id}
        />
      </div>
    </MyDialog>
  );
};

export default ComplainStatusChangeDialog;
