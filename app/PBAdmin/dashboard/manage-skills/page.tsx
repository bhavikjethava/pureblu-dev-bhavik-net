'use client';
import Breadcrumb from '@/components/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconAddLine, IconEdit, IconLoading, IconMinus } from '@/utils/Icons';
import TableComponent from '@/components/Table';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/SelectBox';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import AddSkill from './AddSkill';
import { validateForm } from '@/utils/FormValidationRules';
import { getActiveDeactiveMsg, updateArray } from '@/utils/utils';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface ManageSkillColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

interface ManageSkillProps {
  id?: string;
  title?: string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
}

function ManageSkill() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<ManageSkillProps | null>(
    null
  );
  const [skillList, setSkillList] = useState<Array<ManageSkillProps>>();
  const [errors, setErrors] = useState<ManageSkillProps>({});
  const [saveLoading, setLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmationDialogOpen, setConfirmationDialog] = useState(false);

  useEffect(() => {
    fetchSkillList();
  }, []);

  const handleSave = async (_formData: any) => {
    const { name, description } = _formData;
    const valifationRules = [
      { field: 'name', value: name, message: 'Title' },
      { field: 'description', value: description, message: 'Description' },
    ];
    let { isError, errors } = validateForm(valifationRules);

    if (isError) {
      setErrors(errors);
    } else {
      setLoading(true);
      if (selectedSkill?.id) {
        let params = {
          ..._formData,
        };
        let status = await updateSkill(selectedSkill.id, params);
        if (status) {
          setSelectedSkill(null);
          setShowModal(false);
        }
      } else {
        const skill = {
          endpoint: API_ENDPOINTS.SKILL,
          method: 'POST',
          body: _formData,
        };
        const response = await apiAction.mutateAsync(skill);
        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setSelectedSkill(null);
          setShowModal(false);
          fetchSkillList();
        }
      }
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
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

  const fetchSkillList = async () => {
    try {
      const fetchSkill = {
        endpoint: `${API_ENDPOINTS.SKILL}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchSkill);
      if (data) setSkillList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const updateSkill = async (id: string | undefined, params: any) => {
    try {
      let updateSkillRequest = {
        endpoint: `${API_ENDPOINTS.SKILL}/${id}`,
        method: 'PATCH',
        body: params,
      };
      const { data, isError, errors } =
        await apiAction.mutateAsync(updateSkillRequest);
      if (data) {
        data.isLoading = false;
        let tempSkillList = updateArray(skillList || [], data);
        setSkillList([...tempSkillList]);
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

  const handleStatuClick = async () => {
    setLoading(true);
    let params = {
      is_active: selectedSkill?.is_active == 1 ? 2 : 1,
    };
    await updateSkill(selectedSkill?.id, params);
    setLoading(false);
    setConfirmationDialog(false);
    setSelectedSkill({});
  };

  const handleEditClick = (item: ManageSkillProps) => {
    setErrors({});
    setSelectedSkill(item);
    setShowModal(true);
  };

  const handleAddSkillClick = () => {
    setShowModal(true);
  };

  const handleConfirmationDialog = async (item: any) => {
    setSelectedSkill(item);
    setConfirmationDialog(true);
  };

  const columns: ManageSkillColumneProps[] = [
    { accessorKey: 'name', header: 'Skills' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'Action',
      header: 'Action',
      className: '',
      render: (item: ManageSkillProps) => (
        <div className='flex gap-3'>
          {item.is_active == 1 && (
            <Button
              size='xs'
              disabled={item.isLoading}
              onClick={() => handleEditClick(item)}
              icon={<IconEdit />}
            >
              Edit
            </Button>
          )}
          <Button
            size='xs'
            variant='secondary'
            icon={
              item.isLoading ? (
                <IconLoading />
              ) : item.is_active != 1 ? (
                <IconAddLine />
              ) : (
                <IconMinus />
              )
            }
            disabled={item.isLoading}
            onClick={() => handleConfirmationDialog(item)}
          >
            {item.is_active != 1 ? 'Activate' : 'DeActivate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        <Breadcrumb />

        <div className='grid w-full grid-cols-3 gap-5 '>
          <div className='col-span-3 flex gap-5 md:ml-auto'>
            <Button
              variant={'secondary'}
              className='w-full'
              onClick={handleAddSkillClick} // Call the function provided by the
              icon={<IconAddLine className='h-5 w-5 text-white' />}
            >
              Add New Skill
            </Button>
          </div>
        </div>

        <TableComponent columns={columns} data={skillList} />
        {showModal && (
          <AddSkill
            open={showModal}
            data={selectedSkill}
            onSave={handleSave}
            formErrors={errors}
            isLoading={saveLoading}
            onInputChange={handleInputChange} // Pass the handleInputChange function as a prop
            onClose={() => {
              setSelectedSkill(null);
              setShowModal(false);
              setErrors({});
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}

        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => {
            setConfirmationDialog(false);
            setSelectedSkill(null);
          }}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: handleStatuClick,
              btnLoading: saveLoading,
              icon: saveLoading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          {getActiveDeactiveMsg(selectedSkill?.is_active, 'Record')}
        </ConfirmationDialog>
      </div>
    </div>
  );
}

export default ManageSkill;
