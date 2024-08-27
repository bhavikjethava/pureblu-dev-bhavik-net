import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import MyDialog from '../MyDialog';
import ListGroup from '../ListGroup';
import ListGroupItem from '../ListGroupItem';
import EditableField from '../EditableField';
import { ScrollArea } from '../ui/scroll-area';
import AddressField from '../AddressEditableField';
import SelectBox from '../SelectBox';
import InputField from '../InputField';
import DatepickerComponent from '../DatePicker';
import ROUTES, {
  BRANCHLIST,
  DEVICELIST,
  OptionType,
  REFRESHCOMPLAINTLIST,
  REFRESHDIVELIST,
  YYYYMMDD,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import { DataContext } from '@/context/dataProvider';
import { Button } from '../ui/button';
import { IconBxErrorCircle, IconSearch } from '@/utils/Icons';
import TableComponent from '../Table';
import { validateForm } from '@/utils/FormValidationRules';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { useParams, usePathname } from 'next/navigation';
import moment from 'moment';
import { showToast } from '../Toast';
import { setDate } from 'date-fns';
// import MultiSelectDropdown from '../MultiSelect';
import { AnyPtrRecord } from 'dns';

interface AddComplaint {
  isShow: boolean;
  onClose(): void;
  customer: FormData;
  requestTypeList: Array<FormData>;
  apiBaseUrl: any;
}

interface FormData {
  [key: string]: any;
}

interface AddComplaintColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const NEWDEVICE = 1;

const AddComplaint: FC<AddComplaint> = ({
  isShow,
  onClose,
  customer,
  requestTypeList,
  apiBaseUrl,
}) => {
  const [deviceType, setDeviceType] = useState();
  const [formData, setFormData] = useState<FormData>({
    initial_price: 500,
    assign_date: new Date(),
  });
  const [branchList, setBranchList] = useState<Array<OptionType>>([]);
  const [filterBranchList, setFilterBranchList] = useState<Array<OptionType>>(
    []
  );
  const [deviceList, setDeviceList] = useState<Array<OptionType>>([]);
  const [filterDeviceList, setFilterDeviceList] = useState<any>([]);
  const [errors, setErrors] = useState<FormData>({});
  const [isLoading, setLoading] = useState(false);
  const [search, setSearch] = useState({
    search: '',
    branch_id: -1,
  });
  const { state, setData } = useContext(DataContext);
  // const [exstingRequestFromData, setExstingRequestFromData] = useState<any>({});
  const [dateChange, setDateChange] = useState<any>('');
  const [deviceTypeList, setDeviceTypeList] = useState([
    { id: NEWDEVICE, name: 'New' },
    { id: 2, name: 'Existing' },
  ]);
  const [optionsList, setOptionsList] = useState<any>();
  const apiAction = useMutation(apiCall);
  const { id } = useParams();
  const exstingRequestFromData = useRef<any>({});
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  useEffect(() => {
    if (isEnterprise || (isPBPartner && customer?.is_enterprise == 1)) {
      const tempDevideType = deviceTypeList;
      const newDeviceIndex = tempDevideType.findIndex(
        (x) => x.id === NEWDEVICE
      );
      if (newDeviceIndex > -1) {
        tempDevideType.splice(newDeviceIndex, 1);
        setDeviceTypeList((pre: any) => tempDevideType);
      }
    }
  }, []);

  useEffect(() => {
    let tempBranchList: Array<OptionType> = [];
    if (state?.[BRANCHLIST]) tempBranchList = [...state?.[BRANCHLIST]];
    setBranchList(tempBranchList);
    const tempList = [...tempBranchList];
    tempList.unshift({ id: -1, name: 'All' });
    setFilterBranchList(tempList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[BRANCHLIST]]);

  useEffect(() => {
    let tempDeiceList: Array<OptionType> = [];
    if (state?.[DEVICELIST]) tempDeiceList = [...state?.[DEVICELIST]];
    setDeviceList(tempDeiceList);

    const keysToRemove = new Set([
      'branch',
      'brand',
      'device_assign_partner',
      'machine_type',
      'machine_variant',
      'brand_id',
      'capacity',
      'compressor_make',
      'compressor_type',
      'cooling_coil_type_id',
      'cooling_coil_type_name',
      'created_at',
      'deleted_at',
      'device_id',
      'equipment_id',
      'equipment_name',
      'is_old',
      'machine_model_id',
      'note',
      'refrigerant_id',
      'site_requirement',
      'unit_type_id',
      'updated_at',
      'capacity_unit',
      'refrigerant_name',
      'unit_image',
    ]);

    const optimizDeviceList = tempDeiceList.map((device) =>
      removeKeys({ ...device }, keysToRemove)
    );

    setFilterDeviceList([...optimizDeviceList]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.[DEVICELIST]]);

  const memoizedFormData = useMemo(() => {
    return exstingRequestFromData.current;
  }, [dateChange]);

  const removeKeys = (obj: any, keysToRemove: any) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (keysToRemove.has(key)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          removeKeys(obj[key], keysToRemove);
        }
      }
    }
    return obj;
  };

  const onChangeHandler = (field: string, value: string | number | Date) => {
    setFormData((pre) => ({
      ...pre,
      [field]: value,
    }));
    setErrors((pre) => ({
      ...pre,
      [field]: '',
    }));
  };

  const onExistingDeviceChangeHandler = (
    item: any,
    field: string,
    value: any
  ) => {
    item[field] = value;
    let tempList = updateArray(filterDeviceList || [], item);
    setFilterDeviceList([...tempList]);
  };

  const onExistingChangeHandlerNew = (item: any, field: string, value: any) => {
    // setExstingRequestFromData((pre: any) => ({
    //   ...pre,
    //   [item.id]: {
    //     [field]: value,
    //   },
    // }));
    exstingRequestFromData.current = {
      ...exstingRequestFromData.current,
      [item.id]: {
        ...exstingRequestFromData.current?.[item.id],
        [field]: value,
        branch_id: item.branch_id,
        device_id: item?.id,
      },
    };
    // console.log(exstingRequestFromData);
    if (field === 'assign_date') {
      setDateChange(value);
    }
  };

  // filter
  useEffect(() => {
    if (deviceList.length > 0) {
      if (search?.branch_id == -1) {
        onSearch(deviceList);
      } else {
        const _filterDevices = deviceList?.filter((item: any) => {
          const keyToSearch = 'branch.id';
          const keys = keyToSearch.split('.');
          const nestedValue = keys.reduce((obj, key) => obj && obj[key], item);
          return String(nestedValue)
            .toLowerCase()
            .includes(search?.branch_id?.toString());
        });
        onSearch(_filterDevices);
      }
    }
  }, [search.branch_id]);

  const filterChangeHandler = (field: string, value: string) => {
    setSearch((prev) => ({ ...prev, [field]: value }));
  };

  const onSearchClickHandle = () => {
    onSearch(deviceList);
  };

  const onSearch = (list: any) => {
    const _filterDevices = list?.filter((item: any) => {
      const keysToSearch = ['id', 'name'];
      return keysToSearch.some((key) =>
        String(item[key])
          .toLowerCase()
          .includes(search?.search.toLowerCase())
      );
    });
    setFilterDeviceList(_filterDevices);
  };

  const onSave = async () => {
    if (deviceType == NEWDEVICE) {
      // New device
      const {
        branch_id,
        location,
        request_type_id,
        assign_date,
        initial_price,
      } = formData;
      const valifationRules = [
        {
          field: 'branch_id',
          value: branch_id,
          message: 'Installation Location',
        },
        { field: 'location', value: location, message: 'Device Location' },
        {
          field: 'request_type_id',
          value: request_type_id,
          message: 'Complain Type',
        },
        { field: 'assign_date', value: assign_date, message: 'Assign Date' },
        {
          field: 'initial_price',
          value: initial_price,
          message: 'Initial Price',
        },
      ];
      let { isError, errors } = validateForm(valifationRules);
      if (isError) {
        setErrors(errors);
      }
      let body = {
        request_device_type: 'new',
        request_devices: [
          {
            branch_id: formData?.branch_id,
            initial_price: formData?.initial_price,
            device_name: formData?.location,
            request_type_id: formData?.request_type_id,
            assign_date: moment(formData?.assign_date).format(`${YYYYMMDD}`), //hh:mm:ss
          },
        ],
      };
      postComplaint(body);
    } else {
      // existing device
      let request_devices: any = [];
      Object.keys(exstingRequestFromData.current)?.map((x: any) => {
        const currentValue = exstingRequestFromData.current;
        if (currentValue?.[x]?.request_type_id) {
          request_devices.push({
            branch_id: currentValue?.[x]?.branch_id,
            initial_price: currentValue?.[x]?.initial_price || 0,
            request_type_id: currentValue?.[x]?.request_type_id,
            assign_date: moment(
              currentValue?.[x]?.assign_date || new Date()
            ).format(`${YYYYMMDD}`),
            device_id: currentValue?.[x]?.device_id,
          });
        }
      });

      // filterDeviceList.map((x: any) => {
      //   if (x?.request_type_id) {
      //     request_devices.push({
      //       branch_id: x?.branch?.id,
      //       initial_price: x?.initial_price || 0,
      //       request_type_id: x?.request_type_id,
      //       assign_date: moment(x?.assign_date || new Date()).format(
      //         `${YYYYMMDD}`
      //       ),
      //       device_id: x?.id,
      //     });
      //   }
      // });
      if (request_devices.length == 0) {
        showToast({
          variant: 'destructive',
          message: 'Select atleast one device.',
          icon: <IconBxErrorCircle className='h-6 w-6' />,
        });
      } else {
        let body = {
          request_device_type: 'existing',
          request_devices,
        };
        postComplaint(body);
      }
    }
  };

  const postComplaint = async (body: any) => {
    try {
      setLoading(true);
      const postRequest = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/request`,
        method: 'POST',
        body: body,
      };
      const response = await apiAction.mutateAsync(postRequest);
      if (response?.isError) {
        const error = {
          branch_id: response?.errors?.[`requests.0.branch_id`],
          initial_price: response?.errors?.['requests.0.initial_price'],
          name: response?.errors?.['requests.0.name'],
          request_type_id: response?.errors?.['requests.0.request_type_id'],
          assign_date: response?.errors?.['requests.0.assign_date'],
        };
        setErrors(error);
      } else {
        if (deviceType == NEWDEVICE) {
          setData({ [REFRESHDIVELIST]: !state?.[REFRESHDIVELIST] });
        }
        setData({ [REFRESHCOMPLAINTLIST]: !state?.[REFRESHCOMPLAINTLIST] });
        onClose?.();
      }
    } catch (e) {
      console.log('===> error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (id: any) => {
    const options = { [id]: requestTypeList };
    setOptionsList(options);
  };

  const columns: AddComplaintColumneProps[] = [
    {
      accessorKey: 'name',
      header: 'Device Name',
      render: (item: any) => (
        <span>
          {item.id} - {item.name}
        </span>
      ),
    },
    {
      accessorKey: 'device_detail',
      header: 'Device Details',
      render: (item: any) => (
        <div>
          {item?.units.map((x: any) => (
            <span key={x.id}>{`${x.unit_type?.name} - Model No: ${
              x?.machine_model?.model_number || 'Not know'
            } - Serial No: ${x?.serial_number || ''}`}</span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'amc_plan',
      header: 'Amc Plan',
      render: (item: any) => (
        <span>{item?.amc_registration?.amc_plan?.amc_code || 'No Amc'}</span>
      ),
    },
    {
      accessorKey: 'amc_end_date',
      header: 'AMC End Date',
      render: (item: any) => (
        <span>
          {item?.amc_registration
            ? item?.amc_registration?.terminated_date
              ? `Device Terminated Date: ${moment(
                  item?.amc_registration?.terminated_date
                ).format(YYYYMMDD)}`
              : moment(item?.amc_registration?.end_date).format(YYYYMMDD)
            : ''}
        </span>
      ),
    },
    {
      accessorKey: 'assign_date',
      header: 'Assign Date',
      render: (item: any) => (
        <DatepickerComponent
          selectedDate={memoizedFormData?.[item.id]?.assign_date || new Date()}
          onChange={(date) => {
            // onExistingDeviceChangeHandler(
            //   item,
            //   'assign_date',
            //   date || new Date()
            // )
            onExistingChangeHandlerNew(item, 'assign_date', date || new Date());
          }}
          dateFormat='dd/MM/yyyy'
          error={item?.errors?.assign_date || ''}
        />
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      render: (item: any) => (
        <InputField
          type={'number'}
          // value={item?.initial_price ?? 0}
          onChange={(e) => {
            // onExistingDeviceChangeHandler(item, 'initial_price', e)
            onExistingChangeHandlerNew(item, 'initial_price', e);
          }}
          error={item?.errors?.initial_price || ''}
        />
      ),
    },
    {
      accessorKey: 'complain_type',
      header: 'Complain Type',
      render: (item: any, index: number) => (
        // <SelectBox
        //   label=''
        //   className='w-full'
        //   options={requestTypeList}
        //   value={item?.request_type_id}
        //   onChange={(e) =>
        //     onExistingDeviceChangeHandler(item, 'request_type_id', e)
        //   }
        //   error={errors?.request_type_id || ''}
        // />
        <div className='input-field w-full'>
          {/* <MultiSelectDropdown
            options={requestTypeList}
            label=''
            className='custome-with'
            getOptionValue={(option) => option.id} // Pass getOptionValue function
            getOptionLabel={(option) => option.name} // Pass getOptionLabel function
            onChange={(e: any) => {
              // onExistingDeviceChangeHandler(item, 'request_type_id', e.id)
              onExistingChangeHandlerNew(item, 'request_type_id', e.id);
            }}
            error={errors?.request_type_id || ''}
            // value={item?.request_type_id}
            isMulti={false}
            closeMenuOnSelect={true}
          /> */}
          <SelectBox
            options={requestTypeList}
            label=''
            className='custome-with'
            optionKey={'id'} // Pass getOptionValue function
            optionValue='name' // Pass getOptionLabel function
            onChange={(e: any) => {
              // onExistingDeviceChangeHandler(item, 'request_type_id', e.id)
              onExistingChangeHandlerNew(item, 'request_type_id', e);
            }}
            error={errors?.request_type_id || ''}
            // value={item?.request_type_id}
          />
          {/* <select
            name={`device-type-${item?.id}`}
            id={`device-type-${item?.id}`}
            className='custom-select w-full font-medium'
            // onClick={() => handleClick(item?.id)}
            onChange={(e: any) => {
              onExistingChangeHandlerNew(
                item,
                'request_type_id',
                e?.target?.value
              );
            }}
            defaultValue={-1}
          >
            <option value={-1} disabled>
              Select...
            </option>
            {requestTypeList?.map((reqType: any) => (
              <option key={reqType?.id} value={reqType?.id}>
                {reqType?.name}
              </option>
            ))}
          </select>
          {errors?.request_type_id && (
            <div className='mt-1 text-xs text-pbHeaderRed'>
              {errors?.request_type_id || ''}
            </div>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <MyDialog
      open={isShow}
      onClose={onClose}
      title='Add New Complaint'
      ClassName='sm:max-w-[90%] grow min-h-[80%] max-h-[80%] h-full'
      buttons={
        deviceType
          ? [
              {
                text: 'Save',
                variant: 'blue',
                size: 'sm',
                onClick: onSave,
                btnLoading: isLoading,
              },
            ]
          : []
      }
    >
      <div className='flex h-full grow flex-col divide-x-2 overflow-hidden md:flex-row'>
        <div className='w-full flex-none overflow-auto rounded-sm bg-white pl-5 pr-1 text-base md:w-[300px] '>
          <div className='relative flex h-full grow flex-col divide-y divide-gray-200'>
            <ScrollArea className='pr-4'>
              <ListGroup>
                <ListGroupItem
                  label='Name of Contact'
                  // value={`PBCUS-s${selectedformData?.id}`}
                  // loading={!selectedformData} // Add loading prop here
                />
                <ListGroupItem>
                  <EditableField
                    label='Name of Customers'
                    value={customer?.name || ''}
                  />
                </ListGroupItem>
                <ListGroupItem>
                  <EditableField
                    label='Contact Number'
                    value={customer?.phone || ''}
                  />
                </ListGroupItem>
                <ListGroupItem>
                  <AddressField label='Address' selectedformData={customer} />
                </ListGroupItem>
              </ListGroup>
            </ScrollArea>
          </div>
        </div>
        <div className='flex w-full grow flex-col gap-4 p-4'>
          <div className='grid w-full grid-cols-5 gap-4 pt-6'>
            <SelectBox
              label='Device Type'
              options={deviceTypeList}
              value={deviceType}
              onChange={setDeviceType}
            />
            {deviceType == 2 && (
              <>
                <SelectBox
                  label='Installation Location'
                  options={filterBranchList}
                  value={search.branch_id}
                  onChange={(e) => filterChangeHandler('branch_id', e)}
                  error={errors?.branch_id || ''}
                />
                <InputField
                  label='Device Name or ID'
                  type={'text'}
                  value={search.search}
                  onChange={(e) => filterChangeHandler('search', e)}
                />
                <Button
                  className='mt-7'
                  icon={<IconSearch className='h-4' />}
                  onClick={onSearchClickHandle}
                >
                  Search
                </Button>
              </>
            )}
          </div>
          {deviceType &&
            (deviceType == NEWDEVICE ? (
              <div className='grid w-full grid-cols-5 gap-4 pt-6'>
                <SelectBox
                  label='Installation Location'
                  options={branchList}
                  value={formData.branch_id}
                  onChange={(e) => onChangeHandler('branch_id', e)}
                  error={errors?.branch_id || ''}
                />
                <InputField
                  label='Device Location'
                  type={'text'}
                  value={formData?.location || ''}
                  onChange={(e) => onChangeHandler('location', e)}
                  error={errors?.location || ''}
                />
                <SelectBox
                  label='Complain Type'
                  options={requestTypeList}
                  value={formData?.request_type_id}
                  onChange={(e) => onChangeHandler('request_type_id', e)}
                  error={errors?.request_type_id || ''}
                />
                <DatepickerComponent
                  label='Assign Date'
                  minDate={new Date()}
                  selectedDate={formData.assign_date}
                  onChange={(date) =>
                    onChangeHandler('assign_date', date || new Date())
                  }
                  dateFormat='dd/MM/yyyy'
                  error={errors?.assign_date || ''}
                />
                <InputField
                  label='Initial Price'
                  type={'number'}
                  value={formData?.initial_price || ''}
                  onChange={(e) => onChangeHandler('initial_price', e)}
                  error={errors?.initial_price || ''}
                />
              </div>
            ) : (
              <TableComponent
                columns={columns}
                data={filterDeviceList}
                tbodyClass='min-h-[400px]'
              />
            ))}
        </div>
      </div>
    </MyDialog>
  );
};

export default AddComplaint;
