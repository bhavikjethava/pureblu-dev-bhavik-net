'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { validateForm } from '@/utils/FormValidationRules';
import { getActiveDeactiveMsg, updateArray } from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import AddGrades from './AddGrades';

interface ManageGradesColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageGradesProps {
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ManageGrades() {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ManageGradesProps | null>(
    null
  );
  const [list, setList] = useState<Array<ManageGradesProps>>();
  const [helperData, setHelperData] = useState({
    skill: undefined,
    machine_variant: undefined,
  } as {
    skill: [] | undefined;
    machine_variant: [] | undefined;
  });
  const [errors, setErrors] = useState<ManageGradesProps>({});
  const [saveLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmation, setConfirmation] = useState(false);
  const apiAction = useMutation(apiCall);

  const fetchHelperData = async () => {
    try {
      const skillsresponse = {
        endpoint: API_ENDPOINTS.SKILL,
        method: 'GET',
      };

      const machineresponse = {
        endpoint: API_ENDPOINTS.MACHINEVARIANT,
        method: 'GET',
      };

      const skillsData = await apiAction.mutateAsync(skillsresponse);
      const machineData = await apiAction.mutateAsync(machineresponse);

      setHelperData({
        skill: skillsData.data.data,
        machine_variant: machineData.data.data,
      });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  useEffect(() => {
    fetchList();
    fetchHelperData();
  }, []);

  const handleSave = async (formData: FormData) => {
    const { name, skill_ids, machine_variant_ids } = formData;
    const valifationRules = [{ field: 'name', value: name, message: 'Name' }];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedItem?.id) {
        let params = {
          name,
          skill_ids,
          machine_variant_ids,
        };
        let status = await update(selectedItem.id, params);
        if (status) {
          setSelectedItem(null);
          setShowModal(false);
        }
      } else {
        const request = {
          endpoint: API_ENDPOINTS.GEADE,
          method: 'POST',
          body: formData,
        };
        const response = await apiAction.mutateAsync(request);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setSelectedItem(null);
          setShowModal(false);
          fetchList();
        }
      }
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string | number) => {
    // Update the form data state in the parent component
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    setErrors((prevError) => {
      return {
        ...prevError,
        [key]: '',
      };
    });
  };

  const fetchList = async () => {
    try {
      const fetchRequest = {
        endpoint: `${API_ENDPOINTS.GEADE}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setList(data);
      else setList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const update = async (id: string | undefined, params: any) => {
    try {
      let updateRequest = {
        endpoint: `${API_ENDPOINTS.GEADE}/${id}`,
        method: 'PATCH',
        body: params,
      };
      const { data, isError, errors } =
        await apiAction.mutateAsync(updateRequest);
      if (data) {
        data.isLoading = false;
        let tempList = updateArray(list || [], data);
        setList([...tempList]);
      }
      if (isError) {
        setErrors(errors);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleEditClick = (item: ManageGradesProps) => {
    setErrors({});
    setSelectedItem(item);
    setShowModal(true);
  };

  const columns: ManageGradesColumneProps[] = [
    { accessorKey: 'name', header: 'Greads' },
    {
      accessorKey: 'skills',
      header: 'Skills',
      render: (item: any) => (
        <span>
          {item?.skills?.map((skill: any, index: number) => (
            <span key={index}>
              {skill?.name} {index < item.skills.length - 1 && ', '}{' '}
              {/* Add comma and space if not the last skill */}
            </span>
          ))}
        </span>
      ),
    },

    {
      accessorKey: 'Action',
      header: 'Action',
      className: 'max-w-[220px] w-full',
      render: (item: ManageGradesProps) => (
        <Button
          size='xs'
          disabled={item.isLoading}
          onClick={() => handleEditClick(item)}
          icon={<IconEdit />}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <TableComponent columns={columns} data={list} />
        {showModal && (
          <AddGrades
            open={showModal}
            data={selectedItem}
            onSave={handleSave}
            helperData={helperData}
            formErrors={errors}
            isLoading={saveLoading}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setSelectedItem(null);
              setShowModal(false);
              setErrors({});
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}
      </div>
    </div>
  );
}

export default ManageGrades;
