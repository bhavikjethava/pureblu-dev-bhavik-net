import React, { useContext, useEffect, useState } from 'react';
import MyDialog from '@/components/MyDialog';
import { useMutation } from 'react-query';
import { apiCall, useStateCity } from '@/hooks/api';
import { IconAddLine, IconEdit, IconLoading } from '@/utils/Icons';
import ROUTES, {
  BRANCHLIST,
  HELPERSDATA,
  OptionType,
  PARTNERS,
  REFRESHBRANCHLIST,
  deleteArrayItem,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import { useParams, usePathname } from 'next/navigation';
import TableComponent from '../Table';
import { Button } from '../ui/button';
import AddBranch from './AddBranch';
import ConfirmationDialog from '../ConfirmationDialog';
import { DataContext } from '@/context/dataProvider';
import SelectBox from '../SelectBox';
import { ERROR_MESSAGES, isRequired } from '@/utils/ValidationUtils';

interface BranchListProps {
  open: boolean;
  selectedData?: any;
  onInputChange?: (key: string, value: any) => void;
  onClose?: () => void;
  onAddBranch?: (newData: any) => void;
  formErrors?: { [key: string]: string };
  apiBaseUrl: any;
}

interface BranchData {
  [key: string]: any;
}

interface BranchColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any;
}

const BranchList: React.FC<BranchListProps> = ({
  open,
  onClose,
  selectedData,
  onAddBranch,
  apiBaseUrl,
}) => {
  const [selectedformData, setselectedBranchData] = useState<BranchData>({
    ...selectedData,
  });
  const { state, setData } = useContext(DataContext);
  const [itemList, setitemList] = useState<BranchData>();
  const [showBranchModal, setBranchshowModal] = useState(false);
  const [selectedItem, setselectedItem] = useState<BranchData>();
  const [isConfirmation, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [helperData, setHelperData] = useState();
  const [errors, setErrors] = useState<{ [Key: string]: string }>({});
  const [showPartnerDialog, setPartnerDialog] = useState(false);
  const [partnerList, setPartnerList] = useState<
    Array<{ [Key: string]: string }>
  >([]);
  const [selectedBranch, setSelectedBranch] = useState<{
    [Key: string]: any;
  }>({});
  const { id } = useParams();
  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBenterPrise = basePath == ROUTES.PBENTERPRISE;

  useEffect(() => {
    let tempCustomer = {
      data: state?.[BRANCHLIST],
    };
    setitemList(tempCustomer);
  }, [state?.[BRANCHLIST]]);

  useEffect(() => {
    if (state?.[HELPERSDATA]) {
      setHelperData((pre: any) => {
        return {
          ...pre,
          data: state?.[HELPERSDATA],
        };
      });
    }
  }, [state?.[HELPERSDATA]]);

  useEffect(() => {
    if (isPBenterPrise) {
      setPartnerList(state?.[PARTNERS]);
    }
  }, [state?.[PARTNERS]]);

  useEffect(() => {
    if (isPBenterPrise && state?.[PARTNERS] == undefined) {
      fetchPartner();
    }
  }, []);

  const fetchPartner = async () => {
    try {
      const fetchPartner = {
        endpoint: `${apiBaseUrl.PARTNER_USER}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchPartner);
      if (data) {
        setData({ [PARTNERS]: data });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleAddBranch = async () => {
    setselectedItem({});
    setBranchshowModal(true);
    setErrors({});
  };

  const handleDeleteClick = (item: any) => {
    setConfirmation(true);
    setselectedItem(item);
  };

  const handleEditClick = (rowData: any) => {
    setselectedItem({
      ...rowData,
      allState: [{ ...rowData?.state }],
      allCity: [{ ...rowData?.city }],
    });
    setBranchshowModal(true);
    setErrors({});
  };

  const handlePartnerClick = (item: any) => {
    setSelectedBranch(item);
    setPartnerDialog(true);
  };

  const onPartnerChangeHandler = (key: string, id: number) => {
    setSelectedBranch((prev) => ({
      ...prev,
      [key]: id,
    }));
    setErrors({});
  };

  const onClosePartnerDialog = () => {
    setPartnerDialog(false);
    setSelectedBranch({});
  };

  const handlePartnerSave = async () => {
    const { partner_id } = selectedBranch;
    if (!isRequired(partner_id)) {
      setErrors({ partner_id: `Please select partner` });
      return;
    }
    try {
      setLoading(true);
      const assignPartner = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/branch/${selectedBranch?.id}/assign-full-branch`,
        method: 'POST',
        body: {
          partner_id,
        },
      };

      const { data } = await apiAction.mutateAsync(assignPartner);
      if (data) {
        setPartnerDialog(false);
        let tempSelectedBranch = selectedBranch;
        tempSelectedBranch['partner_id'] = partner_id;
        let tempBranchList = updateArray(
          state?.[BRANCHLIST],
          tempSelectedBranch
        );
        setData({ [BRANCHLIST]: [...tempBranchList] });
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmationClick = async () => {
    setLoading(true);
    try {
      const deleteCustomer = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedformData?.id}/branch/${selectedItem?.id}`,
        method: 'DELETE',
      };

      const { data, isError } = await apiAction.mutateAsync(deleteCustomer);
      if (!isError) {
        const tempCustomer = {
          data: deleteArrayItem(itemList?.data, selectedItem as any),
        };
        setConfirmation(false);
        setitemList(tempCustomer);
        setConfirmation(false);
        setselectedItem({});
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleSave = async (response: any) => {
    if (response) {
      let tempCustomer = {
        data: updateArray(itemList?.data, response),
      };
      setitemList({ ...tempCustomer });
    } else {
      setData({ [REFRESHBRANCHLIST]: !state?.[REFRESHBRANCHLIST] });
    }
  };

  const columns: BranchColumn[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'address_1',
      header: 'Address',
      render: (item: any) => (
        <span className='block  '>
          {item?.address_1}
          {item?.address_2 || ''
            ? ',' + ' ' + (item?.address_3 || '')
            : ''}{' '}
          {item?.city?.name}
        </span>
      ),
    },
    {
      accessorKey: 'locality',
      header: 'Locality',
      className: 'max-w-[150px]',
    },
    {
      accessorKey: 'phone',
      header: 'Contact No',
      className: 'max-w-[150px]',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      className: 'min-w-[220px] ',
      render: (item: any) => (
        <div className='block max-w-[100px] whitespace-normal'>
          {item?.email}
        </div>
      ),
    },
  ];

  if (selectedformData?.is_enterprise === 2 || isPBenterPrise) {
    columns.push({
      accessorKey: 'Action',
      header: 'Action',
      className: 'min-w-[200px] ',
      render: (item: any) => (
        // isPBPartner && (
        <div className='flex flex-wrap gap-3 '>
          {isPBenterPrise && (
            <Button
              size='xs'
              icon={<IconAddLine />}
              onClick={() => handlePartnerClick(item)}
            >
              Partner
            </Button>
          )}
          <Button
            size='xs'
            onClick={() => handleEditClick(item)}
            icon={<IconEdit />}
          >
            Edit
          </Button>
          {!isPBenterPrise && (
            <Button
              size='xs'
              variant={'destructive'}
              onClick={() => handleDeleteClick(item)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
      // ),
    });
  }

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Installation Locations'
      ClassName='sm:max-w-[90%]  grow h-full max-h-[90%]'
      buttons={
        selectedformData.is_enterprise === 2 || isPBenterPrise
          ? [
              {
                text: 'Add Branch',
                variant: 'blue',
                size: 'sm',
                onClick: handleAddBranch,
                btnLoading: loading,
                icon: loading ? <IconLoading /> : '',
              },
            ]
          : []
      }
    >
      <div className='flex h-[85%] grow  flex-col p-5'>
        <TableComponent columns={columns} data={itemList?.data} />
      </div>

      {showBranchModal && (
        <AddBranch
          open={!!selectedformData.id}
          selectedCustomerID={selectedformData.id}
          selectedBranchData={selectedItem}
          helperData={helperData}
          onSave={handleSave}
          apiBaseUrl={apiBaseUrl}
          onClose={() => setBranchshowModal(false)} // Set onClose to a function that sets selectedRow to null
        />
      )}

      <ConfirmationDialog
        isOpen={isConfirmation}
        onClose={() => {
          setConfirmation(false);
          setselectedItem({});
        }}
        buttons={[
          {
            text: 'Yes',
            variant: 'destructive',
            size: 'sm',
            onClick: handleDeleteConfirmationClick,
            btnLoading: loading,
            icon: loading ? <IconLoading /> : '',
          },
        ]}
        ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
      >
        Do You Really Want to Delete This Record
      </ConfirmationDialog>

      <MyDialog
        open={showPartnerDialog}
        onClose={onClosePartnerDialog}
        title='Add / Edit Partner'
        buttons={[
          {
            text: 'Save',
            variant: 'blue',
            size: 'sm',
            onClick: handlePartnerSave,
            btnLoading: loading,
            icon: loading ? <IconLoading /> : '',
          },
        ]}
      >
        <div className='flex h-[85%] grow  flex-col p-5'>
          <SelectBox
            options={partnerList}
            value={selectedBranch?.partner_id}
            onChange={(e) => onPartnerChangeHandler('partner_id', e)}
            error={errors?.partner_id}
          />
        </div>
      </MyDialog>
    </MyDialog>
  );
};

export default BranchList;
