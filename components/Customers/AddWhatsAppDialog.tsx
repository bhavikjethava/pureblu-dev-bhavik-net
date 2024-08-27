import React, { FC, useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import { IconAddLine, IconEdit, IconLoading } from '@/utils/Icons';
import InputField from '../InputField';
import CheckboxItem from '../CheckboxItem';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ROUTES, {
  deleteArrayItem,
  getActiveDeactiveMsg,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { usePathname } from 'next/navigation';
import { ERROR_MESSAGES } from '@/utils/ValidationUtils';
import TableComponent from '../Table';
import { Button } from '../ui/button';
import ConfirmationDialog from '../ConfirmationDialog';

interface AddWhatsAppDialogProps {
  open: boolean;
  onClose?: () => void;
  apiBaseUrl: any;
  selectedItem: any;
}

interface FormData {
  [Key: string]: any;
}

interface WhatsAppColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

const AddWhatsAppDialog: FC<AddWhatsAppDialogProps> = ({
  open,
  onClose,
  apiBaseUrl,
  selectedItem,
}) => {
  const [loading, setLoading] = useState(false);
  const [showAddWhatsAppDialog, setAddWhatsAppDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormData>({});
  const [branchList, setBranchList] = useState<FormData[]>([]);
  const [whatsAppList, setWhatsAppList] = useState<FormData[]>();
  const [selectedWhatsAppItem, setSelectedWhatsAppItem] = useState<FormData>(
    {}
  );
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBenterPrise = basePath == ROUTES.PBENTERPRISE;

  useEffect(() => {
    // if (showAddWhatsAppDialog) {
    fetchBranches();
    // }
  }, []);

  useEffect(() => {
    fetchWhatsAppInfo();
  }, []);

  const fetchWhatsAppInfo = async () => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedItem?.id}/whatsapp?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setWhatsAppList(data);
      else setWhatsAppList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const fetchRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedItem?.id}/branch?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchRequest);
      if (data) setBranchList(data);
      else setBranchList([]);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleAddWahtsInfo = () => {
    setAddWhatsAppDialog(true);
  };

  const onCloseAddModal = () => {
    setAddWhatsAppDialog(false);
    setConfirmationDialogOpen(false);
    setErrors({});
    setSelectedWhatsAppItem({});
    setFormData({});
    const tempBranchList: FormData[] = branchList.map((branch) => {
      return { ...branch, isChecked: false };
    });
    setBranchList(tempBranchList);
  };

  const onEditClick = (item: FormData) => {
    setSelectedWhatsAppItem(item);
    setFormData(item);
    setAddWhatsAppDialog(true);

    const tempBranchList: FormData[] = branchList.map((branch) => {
      return { ...branch, isChecked: item?.branch_ids?.includes(branch?.id) };
    });
    if (tempBranchList.length == item?.branch_ids?.length) {
      handleInputChange('select_all', true);
    }
    setBranchList(tempBranchList);
  };

  const selectAll = (checked: boolean) => {
    handleInputChange('select_all', checked);
    const tempBranchList = [...branchList];
    tempBranchList.map((branch: FormData) => (branch.isChecked = checked));
    setBranchList(tempBranchList);
    setErrors((prev) => ({
      ...prev,
      branch_ids: '',
    }));
  };

  const onSelectBranch = (branch: FormData, checked: boolean) => {
    branch.isChecked = checked;
    const tempBranchList = updateArray(branchList, branch);
    setBranchList([...tempBranchList]);

    const branchCount = tempBranchList.length;
    const selectedBranchCount =
      tempBranchList.filter((_branch: FormData) => _branch.isChecked == true)
        ?.length || 0;
    if (branchCount === selectedBranchCount) {
      handleInputChange('select_all', checked);
    } else {
      handleInputChange('select_all', false);
    }
    setErrors((prev) => ({
      ...prev,
      branch_ids: '',
    }));
  };

  const onActiveInactiveClick = (item: FormData) => {
    setSelectedWhatsAppItem(item);
    setConfirmationDialogOpen(true);
  };

  const handleStatuClick = () => {
    if (selectedWhatsAppItem.isDelete) {
      onDelete();
    } else {
      handleSave(true);
    }
  };

  const onDeleteClick = (item: any) => {
    item.isDelete = true;
    setSelectedWhatsAppItem(item);
    setConfirmationDialogOpen(true);
  };

  const handleSave = async (status: boolean = false) => {
    const { name, phone, is_active, is_enterprise_login } = formData;
    const valifationRules = [
      { field: 'name', value: name, message: 'Name' },
      {
        field: 'phone',
        value: phone,
        message: 'Phone',
        type: VALIDATIONTYPE.ISPHONE,
      },
    ];

    let { isError, errors } = validateForm(valifationRules);
    let selectedBranch = branchList.filter((branch) => branch.isChecked);
    if (selectedBranch.length == 0) {
      isError = true;
      errors['branch_ids'] = `Branch${ERROR_MESSAGES.required}`;
    }
    if (isError && status === false) {
      setErrors(errors);
    } else {
      setLoading(true);
      let params = {
        name,
        phone,
        is_active: is_active == true ? 1 : 2,
        branch_ids: selectedBranch.map((branch) => branch?.id),
        is_enterprise_login: is_enterprise_login == true ? 1 : 2,
      } as any;
      if (status === true) {
        params = { is_active: selectedWhatsAppItem.is_active == 1 ? 2 : 1 };
      }
      try {
        const postRequest = {
          endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedItem?.id}/whatsapp`,
          method: 'POST',
          body: params,
        };

        if (selectedWhatsAppItem?.id) {
          postRequest.endpoint += `/${selectedWhatsAppItem?.id}`;
          postRequest.method = `PATCH`;
        }

        const { data, errors } = await apiAction.mutateAsync(postRequest);
        if (data) {
          if (selectedWhatsAppItem?.id) {
            setWhatsAppList([...updateArray(whatsAppList as any, data)]);
          } else {
            fetchWhatsAppInfo();
          }
          onCloseAddModal();
        } else {
          setErrors(errors);
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const updateIsEnterpriseLogin = async (item: any) => {
    const newValue = item.is_enterprise_login == 1 ? 2 : 1;
    const params = {
      is_enterprise_login: newValue,
    };

    const postRequest = {
      endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedItem?.id}/whatsapp/${item?.id}`,
      method: 'PATCH',
      body: params,
    };

    const { data, errors } = await apiAction.mutateAsync(postRequest);
    if (data) {
      if (item?.id) {
        setWhatsAppList([...updateArray(whatsAppList as any, data)]);
      } else {
        fetchWhatsAppInfo();
      }
    } else {
      setErrors(errors);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const deleteRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedItem?.id}/whatsapp/${selectedWhatsAppItem?.id}`,
        method: 'DELETE',
      };

      const { data, isError } = await apiAction.mutateAsync(deleteRequest);
      if (!isError) {
        setWhatsAppList(
          deleteArrayItem(whatsAppList as any, selectedWhatsAppItem)
        );
        onCloseAddModal();
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: WhatsAppColumn[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'phone', header: 'Mobile' },
    {
      accessorKey: 'branch_name',
      header: 'Branch Name',
      render: (item: FormData) => (
        <span>
          {item?.branches?.map((branch: FormData) => branch?.name).toString()}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (item: FormData) => (
        <>
          <Button
            size={'xs'}
            icon={<IconEdit />}
            onClick={() => onEditClick(item)}
          >
            Edit
          </Button>
          <Button
            size={'xs'}
            className='mx-1'
            variant={item.is_active == 1 ? 'secondary' : 'destructive'}
            onClick={() => onActiveInactiveClick(item)}
          >
            {item.is_active == 1 ? 'Active' : 'Inactive'}
          </Button>
          <Button size={'xs'} onClick={() => onDeleteClick(item)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  // Find the index of the 'action' column
  const actionColumnIndex = columns.findIndex(
    (column) => column.accessorKey === 'action'
  );

  // Add the new column before the 'action' column
  if (isPBenterPrise && actionColumnIndex !== -1) {
    columns.splice(actionColumnIndex, 0, {
      accessorKey: 'is_enterprise_login',
      header: 'Enterprise Login',
      render: (item: FormData) => (
        <Button
          size='xs'
          variant={item.is_enterprise_login == 1 ? 'secondary' : 'yellow'}
          onClick={() => updateIsEnterpriseLogin(item)}
        >
          {item.is_enterprise_login == 1 ? 'Yes' : 'No'}
        </Button>
      ),
    });
  }

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Whatsapp Info'
      ClassName='grow max-w-[91%] min-h-[40%] max-h-[70%]'
      buttons={[
        {
          text: 'Add Whatsapp Info',
          variant: 'blue',
          size: 'sm',
          onClick: handleAddWahtsInfo,
          btnLoading: loading,
          icon: <IconAddLine />,
        },
      ]}
    >
      <div className='flex grow flex-col overflow-auto p-6'>
        <TableComponent columns={columns} data={whatsAppList} />
      </div>
      {showAddWhatsAppDialog ? (
        <MyDialog
          open={showAddWhatsAppDialog}
          onClose={onCloseAddModal}
          title={`${selectedWhatsAppItem?.id ? 'Edit' : 'Add'} Whatsapp Info`}
          ClassName='grow max-w-[91%] min-h-[30%] max-h-[70%]'
          buttons={[
            {
              text: 'Save',
              variant: 'blue',
              size: 'sm',
              onClick: () => handleSave(false),
              btnLoading: loading,
              icon: loading ? <IconLoading /> : '',
            },
          ]}
        >
          <div className='flex grow flex-col overflow-auto p-6'>
            <div className='grid grid-cols-4 gap-5'>
              <InputField
                type='text'
                maxLength={25}
                placeholder='Enter Name'
                value={formData?.name || ''}
                onChange={(e) => handleInputChange('name', e)}
                error={errors?.name || ''}
              />
              <InputField
                type='tel'
                placeholder='Enter Mobile'
                value={formData?.phone || ''}
                onChange={(e) => handleInputChange('phone', e)}
                error={errors?.phone || ''}
              />
              <CheckboxItem
                key='active'
                checked={formData?.is_active == 1} // Check if the current brand id is in the selectedSkillids array
                onCheckedChange={(checked) =>
                  handleInputChange('is_active', checked)
                }
                ariaLabel={'Active'}
                id={`active`}
              />
              {isPBenterPrise && (
                <CheckboxItem
                  key='is_enterprise_login'
                  checked={formData?.is_enterprise_login == 1}
                  onCheckedChange={(checked) =>
                    handleInputChange('is_enterprise_login', checked)
                  }
                  ariaLabel={'Is Enterprise Login'}
                  id={`is_enterprise_login`}
                />
              )}
            </div>
            <div className='pt-6'>
              <CheckboxItem
                key='select_all'
                checked={formData?.select_all} // Check if the current brand id is in the selectedSkillids array
                onCheckedChange={(checked) => selectAll(checked)}
                ariaLabel={'Select All Branch'}
                id={`select_all`}
              />
              <div className='grid grid-cols-4 gap-5 pt-5'>
                {branchList?.map((branch: FormData) => (
                  <CheckboxItem
                    key={`branch_${branch?.id}`}
                    checked={branch?.isChecked} // Check if the current brand id is in the selectedSkillids array
                    onCheckedChange={(checked) =>
                      onSelectBranch(branch, checked)
                    }
                    ariaLabel={branch?.name}
                    id={`branch_${branch?.id}`}
                  />
                ))}
              </div>
              {errors?.branch_ids ? (
                <div className='mt-1 text-xs text-pbHeaderRed'>
                  {errors?.branch_ids}
                </div>
              ) : null}
            </div>
          </div>
        </MyDialog>
      ) : null}
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => {
          setConfirmationDialogOpen(false);
          setSelectedWhatsAppItem({});
        }}
        buttons={[
          {
            text: 'Yes',
            variant: 'destructive',
            size: 'sm',
            onClick: handleStatuClick,
            icon: loading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        {selectedWhatsAppItem.isDelete
          ? 'Are you sure to want to delete this Whatsapp Info ? This action is irreversible.'
          : getActiveDeactiveMsg(selectedWhatsAppItem?.is_active, 'Record')}
      </ConfirmationDialog>
    </MyDialog>
  );
};

export default AddWhatsAppDialog;
