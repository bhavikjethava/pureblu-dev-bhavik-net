import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import InputField from '../InputField';
import SelectBox from '../SelectBox';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { useParams, usePathname } from 'next/navigation';
import ROUTES, {
  ArrayProps,
  BRANCHLIST,
  DEVICELIST,
  HELPERSDATA,
  OptionType,
  YYYYMMDD,
  getAMCColor,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import CheckboxItem from '../CheckboxItem';
import DatepickerComponent from '../DatePicker';
import { Button } from '../ui/button';
import TableComponent, { TableColumn } from '../Table';
import moment from 'moment';
import { DataContext } from '@/context/dataProvider';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import { showToast } from '../Toast';
import StartAMCDialog from './StartAMCDialog';
import ConfirmationDialog from '../ConfirmationDialog';
import AmcInfoDialog from './AmcInfoDialog';
import { isRequired } from '@/utils/ValidationUtils';
import AmcActionDialog from './AmcActionDialog';
import Loader from '../Loader';
import MultiSelectDropdown from '../MultiSelect';

const TYPE = {
  DEVICE: 'device',
  AMC: 'amc',
};
const ACTION = {
  TERMINATE: 'terminated',
  ARCHIVE: 'archive',
  DELETE: 'delete',
};
let isSelectAllAMC = false;
const perPage = 10;
let localPage = 1;

const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedFunction;
};

const AmcDetails = ({ apiBaseUrl, customerData }: any) => {
  const [branchList, setBranchList] = useState<Array<OptionType>>([]);
  const [deviceList, setDeviceList] = useState<Array<OptionType>>([]);
  // const [amcListAll, setAmcListAll] = useState<FormData[]>([]);
  const [amcList, setAMCList] = useState<FormData[] | null>();
  const [filter, setFilter] = useState({
    search: '',
    searchAmcPlan: '',
    selectedBranch: { id: -1, name: 'All Branches' },
    selectedDevice: { id: -1, name: 'All Devices' },
    active: 1,
    futureAMC: 0,
    inactiveAMC: 1,
    archive: 0,
    start_date: null,
    end_date: null,
    page: 1,
  });
  const [total, setTotal] = useState(0);
  const [activateAMC, setActivateAMC] = useState(false);
  const [addNewAMC, setAddNewAMC] = useState(false);
  const [selectedAMCCount, setSelecteedAMCCount] = useState(0);
  const [isSelectAllDevice, setSelectAllDevice] = useState(false);
  const [selectedDeviceCount, setSelecteedDeviceCount] = useState(0);
  const [startAMCModal, setStartAMCModal] = useState(false);
  const [openAMCInfoModal, setOpenAMCinfoModal] = useState(false);
  const [isViewSelectedDevice, setViewSelectedDevice] = useState(false);
  const [amcListColumns, setAMCListColumn] = useState<Array<TableColumn>>([]);
  const [withoutAMCDeviceList, setWithoutAMCDeviceList] =
    useState<Array<ArrayProps>>();
  const [startNewAMCDevices, setStartNewAMCDevices] = useState([]);
  const [confirmationAction, setConfirmationAction] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [selectedAMC, setSelectedAMC] = useState<any>(null);
  const [helperData, setHelperData] = useState();
  const [deleteText, setDeleteText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [amcActionModal, setAMCActionModal] = useState(false);
  const [multiSelectList, setMultiSelectList] = useState([]);
  const [isRenewAMC, setRenewAMC] = useState(false);
  const [search, setSearch] = useState('');
  const [amcPlanSearch, setAmcPlanSearch] = useState('');
  const [fetchAmcLoader, setAmcFetchLoader] = useState(false);
  const [isPageLoaded, setPageLoaded] = useState(false);

  const { id } = useParams();
  const apiAction = useMutation(apiCall);
  const { state } = useContext(DataContext);
  const pathName = usePathname();
  const basePath = getBaseUrl(pathName);
  const isPBEenterprise = basePath == ROUTES.PBENTERPRISE;

  const initialAMCListColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Registration Id',
        render: (item: any) => (
          <span className={getAMCColor(item)}>{item?.id}</span>
        ),
      },
      {
        accessorKey: 'device_name',
        header: 'Device Name',
        render: (item: any) => (
          <div>
            <span className='test12'>{item?.device?.name}</span>
            {item?.device?.units?.map((unit: any, index: number) => (
              <div key={index}>
                <span>{`(${unit?.machine_model?.model_number || ''} - `}</span>
                <span>{`${unit?.serial_number || ''})`}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'amc',
        header: 'AMC',
        render: (item: any) => <span>{item?.amc_plan?.amc_code}</span>,
      },
      {
        accessorKey: 'branch',
        header: 'Branch',
        render: (item: any) => (
          <div className='block'>
            <div>
              <span className='font-bold'>{item?.device?.branch?.name}</span>
            </div>
            <div>
              <span>{item?.device?.branch?.address_1}</span>
            </div>
            <div>
              <span>{item?.device?.branch?.address_2}</span>
            </div>
            <div>
              <span>{item?.device?.branch?.address_3}</span>
            </div>
            <div>
              <span className='font-bold'>Locality:</span>
            </div>
            <div>
              <span>{item?.device?.branch?.locality}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'request_date',
        header: 'Request Date',
        render: (item: any) => (
          <span>{moment(item?.created_at).format(YYYYMMDD)}</span>
        ),
      },
      {
        accessorKey: 'start_date',
        header: 'Start Date',
        render: (item: any) => (
          <span>{moment(item?.start_date).format(YYYYMMDD)}</span>
        ),
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        render: (item: any) => (
          <span>{moment(item?.end_date).format(YYYYMMDD)}</span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        render: (item: any) =>
          filter?.futureAMC == 0 || filter?.futureAMC == 2 ? (
            <div className='flex flex-col space-y-2'>
              <Button
                variant='outline'
                size={'sm'}
                onClick={() => onAMCinfoClick(item)}
              >
                AMC Info
              </Button>
              {customerData?.is_enterprise == 2 && (
                <>
                  {item.terminated_date ? (
                    <Button variant='outline' color='danger'>
                      Terminated on
                      <br />
                      {moment(item.terminated_date).format(YYYYMMDD)}
                    </Button>
                  ) : item.amc_status == 1 ? (
                    <Button
                      variant='outline'
                      size={'sm'}
                      onClick={() => terminateAMCConfirm(item)}
                    >
                      Terminate AMC
                    </Button>
                  ) : null}
                  {!isPBEenterprise &&
                  item.amc_status != 1 &&
                  item.amc_status != 3 ? (
                    <Button
                      variant='outline'
                      size={'sm'}
                      onClick={() => onArchiveAMCConfirm(item)}
                    >
                      Archive
                    </Button>
                  ) : null}
                  <Button
                    variant='outline'
                    size={'sm'}
                    onClick={() => onSingleRenewAMC(item)}
                  >
                    Renew AMC
                  </Button>
                  {/* item.terminated_date && */}
                  {item.amc_status != 1 && !isPBEenterprise ? (
                    <Button
                      variant='outline'
                      size={'sm'}
                      onClick={() => onDeleteAMCConfirmation(item)}
                    >
                      Delete AMC
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <Button
              variant='outline'
              size={'sm'}
              onClick={() => onDeleteAMCConfirmation(item)}
            >
              Delete AMC
            </Button>
          ),
      },
    ],
    [filter.futureAMC, customerData]
  );

  useEffect(() => {
    setAMCListColumn(initialAMCListColumns);
  }, [initialAMCListColumns]);

  useEffect(() => {
    fetchAMC();
  }, [filter]);

  useEffect(() => {
    if ((amcList?.length || 0) > 0)
      setAMCList(amcList?.slice(0, localPage * perPage));
  }, [customerData]);

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
    let tempBranchList: Array<OptionType> = [];
    if (state?.[BRANCHLIST]) tempBranchList = [...state?.[BRANCHLIST]];
    tempBranchList.unshift({ id: -1, name: 'All Branches' });
    setBranchList(tempBranchList);
  }, [state?.[BRANCHLIST]]);

  useEffect(() => {
    let tempDeiceList: Array<OptionType> = [];
    if (state?.[DEVICELIST]) tempDeiceList = [...state?.[DEVICELIST]];
    tempDeiceList.unshift({ id: -1, name: 'All Devices' });
    setDeviceList(tempDeiceList);
  }, [state?.[DEVICELIST]]);

  // useEffect(() => {
  //   setSelecteedAMCCount(isSelectAllAMC ? amcList?.length || 0 : 0);
  // }, [amcList]);

  const inputChangeHandler = (field: string, value: any) => {
    if (field === 'selectedBranch') {
      if (value === -1) {
        let tempDeiceList: Array<OptionType> = [];
        if (state?.[DEVICELIST]) tempDeiceList = [...state?.[DEVICELIST]];
        tempDeiceList.unshift({ id: -1, name: 'All Devices' });
        setDeviceList(tempDeiceList);
      } else {
        let tempDeiceList: Array<OptionType> = [];
        tempDeiceList = state?.[DEVICELIST]?.filter(
          (x: any) => x?.branch_id == value
        );
        tempDeiceList.unshift({ id: -1, name: 'All Devices' });
        setDeviceList(tempDeiceList);
      }
    }
    setFilter((pre) => ({
      ...pre,
      page: 1,
      ...(field === 'selectedBranch' && {
        selectedDevice: { id: -1, name: 'All Devices' },
      }),
      [field]: value,
    }));
  };

  const searchChangeHandler = (value: any) => {
    setSearch(value);
    debouncedInputChangeHandler('search', value);
  };

  const amcPlanSearchChangeHandler = (value: any) => {
    setAmcPlanSearch(value);
    debouncedInputChangeHandler('searchAmcPlan', value);
  };

  const debouncedInputChangeHandler = useDebounce(
    (field: string, value: any) => {
      setFilter((pre) => ({
        ...pre,
        page: 1,
        [field]: value,
      }));
    },
    300
  );

  const checkBoxChangeHandler = (field: string, value: any) => {
    setPageLoaded(false);
    setAMCList(null);
    if (field == 'futureAMC') {
      setFilter((pre) => ({
        ...pre,
        page: 1,
        [field]: value,
        active: 2,
        inactiveAMC: 2,
        archive: 2,
      }));
      clearAllState();
    } else {
      setFilter((pre) => ({
        ...pre,
        page: 1,
        [field]: value,
        futureAMC: 2,
      }));
    }
  };

  const handleLoadMore = () => {
    setFilter((pre) => ({
      ...pre,
      page: pre.page + 1,
    }));
    localPage += 1;
    // // setAMCList(amcListAll.slice(0, localPage * perPage));
    // if (amcList) {
    //   let nextPageData = amcListAll.slice(
    //     localPage * perPage - perPage,
    //     localPage * perPage
    //   );
    //   if (isSelectAllAMC) {
    //     nextPageData = nextPageData.map((x: any) => {
    //       return { ...x, isChecked: true };
    //     });
    //   }
    //   const tempAmcList = [...amcList, ...nextPageData];
    //   setAMCList(tempAmcList);
    //   setSelecteedAMCCount(tempAmcList?.length || 0);
    // }

    // setAmcListAll(data);
    // setAMCList(data.slice(0, localPage * perPage));
  };

  const reFetchAMC = () => {
    setFilter((pre) => ({
      ...pre,
      page: 1,
    }));
    setAMCList(null);
    // fetchAMC();
  };

  const fetchAMC = async () => {
    try {
      // setAMCList(null);
      // setSelecteedAMCCount(0);
      const {
        active,
        inactiveAMC,
        archive,
        start_date,
        end_date,
        selectedBranch,
        selectedDevice,
        search,
        searchAmcPlan,
        futureAMC,
        page,
      } = filter;

      let url = `${apiBaseUrl.CUSTOMERS}/${id}/amc?is_active=${
        active == 1 ? 1 : 2
      }&is_inactive=${inactiveAMC == 1 ? 1 : 2}&is_archive=${
        archive == 1 ? 1 : 2
        // }&is_future=${
        //   futureAMC == 1 ? 1 : 2
      }&`;

      if (futureAMC != 0 && futureAMC != 2) {
        url = `${apiBaseUrl.CUSTOMERS}/${id}/amc/future?`;
      }
      const fetchAMCRequest = {
        endpoint: `${url}amc_plan_search=${searchAmcPlan}&search=${search}&page=${page}&per_page=${perPage}`, // need_all=1
        method: 'GET',
      };

      if (start_date) {
        fetchAMCRequest.endpoint += `&start_date=${moment(start_date).format(
          YYYYMMDD
        )}`;
      }
      if (end_date) {
        fetchAMCRequest.endpoint += `&end_date=${moment(end_date).format(
          YYYYMMDD
        )}`;
      }
      if (selectedBranch?.id > -1) {
        fetchAMCRequest.endpoint += `&branch_id=${selectedBranch?.id}`;
      }
      if (selectedDevice?.id > -1) {
        fetchAMCRequest.endpoint += `&device_id=${selectedDevice?.id}`;
      }
      if (isPageLoaded) setAmcFetchLoader(true);
      const { data } = await apiAction.mutateAsync(fetchAMCRequest);
      if (data?.data) {
        if (page == 1) {
          setSelecteedAMCCount(0);
          setAMCList(data?.data);
        } else {
          setAMCList((prev) => [...(prev || []), ...data?.data]);
        }
        isSelectAllAMC = false;
        localPage = 1;
        // setAmcListAll(data);
        //  setAMCList(data.slice(0, localPage * perPage));
        setTotal(data.total);
        if (activateAMC) {
          setAMCListColumn([
            {
              accessorKey: 'check_action',
              className: 'max-w-8',
              header: (
                <CheckboxItem
                  id='allAMC'
                  checked={isSelectAllAMC}
                  onCheckedChange={onAllAMCSelectClick}
                  ariaLabel=''
                />
              ),
              render: (item: any) => (
                <CheckboxItem
                  id={item.id}
                  checked={item.isChecked}
                  onCheckedChange={(checked) => onAMCChecked(item, checked)}
                  ariaLabel=''
                />
              ),
            },
            ...initialAMCListColumns,
          ]);
        }
      } else {
        setAMCList((prev) => [...(prev || [])]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setAmcFetchLoader(false);
      setPageLoaded(true);
    }
  };

  const fetchWithoutAmcDeviceList = async () => {
    try {
      const fetchDeviceList = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/device?without_amc=1&need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchDeviceList);
      setWithoutAMCDeviceList(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const onActivateAMC = () => {
    setAMCListColumn([
      {
        accessorKey: 'check_action',
        className: 'max-w-8',
        header: (
          <CheckboxItem
            id='allAMC'
            checked={isSelectAllAMC}
            onCheckedChange={onAllAMCSelectClick}
            ariaLabel=''
          />
        ),
        render: (item: any) => (
          <CheckboxItem
            id={item.id}
            checked={item.isChecked}
            onCheckedChange={(checked) => onAMCChecked(item, checked)}
            ariaLabel=''
          />
        ),
      },
      ...initialAMCListColumns,
    ]);
    setActivateAMC(true);
    setFilter((pre) => ({
      ...pre,
      active: 2,
      page: 1,
      archive: 2,
    }));
  };

  const onAddNewAMC = () => {
    setFilter((pre) => ({
      ...pre,
      inactiveAMC: 2,
    }));
    setAddNewAMC(true);
    fetchWithoutAmcDeviceList();
  };

  const onStartNewAMC = () => {
    if (selectedDeviceCount == 0) {
      showToast({
        variant: 'destructive',
        message: 'Please select at least one device to start amc',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } else {
      // display Start amc modal
      setStartAMCModal(true);
      let tempDeviceList = withoutAMCDeviceList?.filter((x) => x.isChecked);
      setStartNewAMCDevices(tempDeviceList as any);
    }
  };

  const onSingleRenewAMC = (item: any) => {
    setStartAMCModal(true);
    setRenewAMC(true);
    const selectedList: any = [item];

    let tempAMCList = selectedList?.map((x: any) => {
      return { ...x.device, amc: x };
    });

    setStartNewAMCDevices(tempAMCList as any);
  };

  const onSaveMultipleAMC = () => {
    if (selectedAMCCount == 0) {
      showToast({
        variant: 'destructive',
        message: 'Please select at least one device to renew amc',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    } else {
      setStartAMCModal(true);
      setRenewAMC(true);
      const selectedList: any = amcList?.filter((x: any) => x.isChecked);

      let tempAMCList = selectedList?.map((x: any) => {
        return { ...x.device, amc: x };
      });

      setStartNewAMCDevices(tempAMCList as any);
    }
  };

  const onCloseSaveMultipleAMC = (isRefech?: boolean) => {
    clearAllState(isRefech);
  };

  const onStartAMCClick = (isRefech?: boolean, item?: any) => {
    setStartAMCModal(false);
    if (isRefech) {
      setSelectedAMC(item[0]);
      setOpenAMCinfoModal(true);
      setAddNewAMC(false);
      // const tempAMCListColumns = amcListColumns;
      // tempAMCListColumns.shift();
      // setAMCListColumn(tempAMCListColumns);
      setAMCListColumn(initialAMCListColumns);
      setActivateAMC(false);
      reFetchAMC();
      setFilter((pre) => ({
        ...pre,
        active: 1,
        inactiveAMC: 1,
        archive: 2,
        futureAMC: 2,
      }));
    } else {
      setAddNewAMC(false);
      clearAllState();
      setActivateAMC(false);
      setSelectAllDevice(false);
      let tempDeviceList = withoutAMCDeviceList?.map(
        (x) => (x.isChecked = false)
      );
      setStartNewAMCDevices(tempDeviceList as any);
    }
  };

  const onDeviceChecked = (item: any, checked: boolean) => {
    let tempDeviceList = [...(withoutAMCDeviceList || [])];
    item.isChecked = checked;
    tempDeviceList = updateArray(tempDeviceList, item);
    setWithoutAMCDeviceList(tempDeviceList);
    let selectedDeviceList = getSelectedListCount(tempDeviceList);
    setSelecteedDeviceCount(selectedDeviceList);
    setSelectAllDevice(selectedDeviceList == withoutAMCDeviceList?.length);
  };

  const onAllDeviceSelect = (checked: boolean) => {
    let tempDeviceList = withoutAMCDeviceList?.map((x) => ({
      ...x,
      isChecked: checked,
    }));
    setWithoutAMCDeviceList(tempDeviceList);
    setSelectAllDevice(checked);
    if (checked) {
      setSelecteedDeviceCount(withoutAMCDeviceList?.length || 0);
    } else {
      setSelecteedDeviceCount(0);
    }
  };

  const onAMCChecked = (item: any, checked: boolean) => {
    item.isChecked = checked;
    let selectedAMCList = 0;
    let tempAmcList: any = [];
    setAMCList((pre: any) => {
      tempAmcList = updateArray(pre, item) as any;
      selectedAMCList = getSelectedListCount(tempAmcList);
      return tempAmcList;
    });

    setSelecteedAMCCount(selectedAMCList);
    let isAllSelect = selectedAMCList == tempAmcList?.length;
    isSelectAllAMC = isAllSelect;
    changeAMCAllSelectCheckbox();
  };

  const onAllAMCSelectClick = (checked: boolean) => {
    setAMCList(
      (pre) =>
        pre?.map((x) => ({
          ...x,
          isChecked: checked,
        }))
    );
    isSelectAllAMC = checked;
    setSelecteedAMCCount(checked ? amcList?.length || 0 : 0);
    changeAMCAllSelectCheckbox();
  };

  const changeAMCAllSelectCheckbox = () => {
    setAMCListColumn([
      {
        accessorKey: 'check_action',
        className: 'max-w-8',
        header: (
          <CheckboxItem
            id='allAMC'
            checked={isSelectAllAMC}
            onCheckedChange={(checked) => onAllAMCSelectClick(checked)}
            ariaLabel=''
          />
        ),
        render: (item: any) => (
          <CheckboxItem
            id={item.id}
            checked={item.isChecked}
            onCheckedChange={(checked) => onAMCChecked(item, checked)}
            ariaLabel=''
          />
        ),
      },
      ...initialAMCListColumns, //.slice(1),
    ]);
  };

  const getSelectedListCount = (list?: Array<ArrayProps>) => {
    const selectedList = list?.filter((x) => x.isChecked);
    if (selectedList !== undefined) {
      return selectedList.length;
    } else {
      return 0;
    }
  };

  const terminateAMCConfirm = (item: any) => {
    setConfirmationAction(ACTION.TERMINATE);
    setSelectedAMC(item);
  };

  const onArchiveAMCConfirm = (item: any) => {
    setConfirmationAction(ACTION.ARCHIVE);
    setSelectedAMC(item);
  };

  const onDeleteAMCConfirmation = (item: any) => {
    setConfirmationAction(ACTION.DELETE);
    setSelectedAMC(item);
  };

  const AMCAction = async () => {
    if (confirmationAction == ACTION.DELETE) {
      deleteAMC();
    } else if (selectedAMC) {
      setLoading(true);
      const { id: amcId } = selectedAMC;
      const body = {
        amc_ids: [amcId],
      };
      try {
        let data;
        let postAction = {
          endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/amc/${amcId}/archive`, // archive amc
          method: 'POST',
          body: {},
        };

        if (confirmationAction == ACTION.TERMINATE) {
          // terminate amc
          postAction.endpoint = `${apiBaseUrl.CUSTOMERS}/${id}/amc/${confirmationAction}`;
          postAction.body = body;
        }

        data = await apiAction.mutateAsync(postAction);
        if (data?.data) {
          reFetchAMC();
        }
      } catch (error) {
        console.error('Failed to fetch resource:', error);
      } finally {
        setLoading(false);
        setConfirmationAction('');
      }
    }
  };

  const deleteAMC = async () => {
    if (selectedAMC) {
      setLoading(true);
      if (deleteText == 'DELETE ME') {
        try {
          const { id: amcId } = selectedAMC;
          const { futureAMC } = filter;
          let postAction = {
            endpoint: `${apiBaseUrl.CUSTOMERS}/${id}/amc/${
              futureAMC !== 0 && futureAMC !== 2 ? 'future/' : ''
            }${amcId}`, // archive amc
            method: 'DELETE',
          };

          const { data } = await apiAction.mutateAsync(postAction);
          if (data) {
            setDeleteText('');
            setConfirmationAction('');
            reFetchAMC();
          }
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch resource:', error);
        } finally {
          setLoading(false);
        }
      } else {
        if (!isRequired(deleteText)) {
          setDeleteError('Please Enter Confiramation text for Delete AMC');
        } else {
          setDeleteError('Please Enter Correct Confiramation text for Delete');
        }
      }
    }
  };

  const onMultipleTerminateAMCClick = () => {
    if (selectedAMCCount > 0) {
      const selectedList: any = amcList?.filter(
        (x: any) => x.isChecked && x.terminated_date == null
      );
      if (selectedList.length > 0) {
        setAMCActionModal(true);
        setMultiSelectList(selectedList);
      } else {
        showToast({
          variant: 'destructive',
          message: 'Only Active Devices can terminate',
          icon: <IconBxErrorCircle className='h-6 w-6' />,
        });
      }
    } else {
      showToast({
        variant: 'destructive',
        message: 'Please select at least one device to cancel amc',
        icon: <IconBxErrorCircle className='h-6 w-6' />,
      });
    }
  };

  const onAMCActionModalClose = (isFetch?: boolean) => {
    clearAllState(isFetch);
  };

  const onViewSelectedDevice = () => {
    if (selectedAMCCount > 0) {
      setViewSelectedDevice(true);
      const selectedList: any = amcList?.filter((x: any) => x.isChecked);
      setAMCActionModal(true);
      setMultiSelectList(selectedList);
    }
  };

  const clearAllState = (isFetch?: boolean) => {
    setAMCActionModal(false);
    setStartAMCModal(false);
    if (selectedAMCCount != 0 || selectedDeviceCount != 0 || activateAMC) {
      const tempAMCListColumns = amcListColumns;
      tempAMCListColumns.shift();
      setAMCListColumn(tempAMCListColumns);
    }
    setActivateAMC(false);
    setSelecteedAMCCount(0);
    setSelecteedDeviceCount(0);
    setMultiSelectList([]);
    setStartNewAMCDevices([]);
    setSelectedAMC(null);
    setRenewAMC(false);
    setSelectAllDevice(false);
    setViewSelectedDevice(false);
    isSelectAllAMC = false;
    if (isFetch) {
      reFetchAMC();
    } else {
      setAMCList(
        (pre) =>
          pre?.map((x) => ({
            ...x,
            isChecked: false,
          }))
      );
    }
  };

  const deviceListColumn = [
    {
      accessorKey: 'check_action',
      className: 'max-w-10',
      header: (
        <CheckboxItem
          id='all'
          checked={isSelectAllDevice}
          onCheckedChange={onAllDeviceSelect}
          ariaLabel=''
        />
      ),
      render: (item: any) => (
        <>
          <CheckboxItem
            id={item.id}
            checked={item.isChecked}
            onCheckedChange={(checked) => onDeviceChecked(item, checked)}
            ariaLabel=''
          />
        </>
      ),
    },
    { accessorKey: 'id', header: 'Device Id' },
    { accessorKey: 'name', header: 'Device Name' },
    {
      accessorKey: 'branch',
      header: 'Branch',
      render: (item: any) => (
        <span className='pbYellow'>{item.branch.name}</span>
      ),
    },
    {
      accessorKey: 'installation_date',
      header: 'Installation Date',
      render: (item: any) => (
        <span>
          {item.installed_on ? moment(item.installed_on).format(YYYYMMDD) : '-'}
        </span>
      ),
    },
  ];

  const renderAMCList = () => (
    <>
      {fetchAmcLoader && <Loader />}
      <TableComponent columns={amcListColumns} data={amcList} />
      {total != 0 &&
        total != amcList?.length && ( // total > localPage * perPage && (
          <div className=''>
            <Button onClick={handleLoadMore} disabled={fetchAmcLoader}>
              Load More
            </Button>
          </div>
        )}
    </>
  );

  const onAMCinfoClick = (item: any) => {
    setSelectedAMC(item);
    setOpenAMCinfoModal(true);
  };

  const renderDeviceList = () => (
    <TableComponent columns={deviceListColumn} data={withoutAMCDeviceList} />
  );

  return (
    <div className='flex h-[calc(100%-65px)] flex-grow flex-col p-6 md:p-5'>
      <div className='flex h-full flex-col gap-5'>
        <div className='grid w-full grid-cols-1 gap-5 rounded-md bg-white p-5  lg:grid-cols-8 lg:gap-8'>
          <div className='lg:col-span-2'>
            <InputField
              type='text'
              placeholder='Search By registration id, device name, serial no or model no'
              value={search}
              onChange={searchChangeHandler}
            />
            <div className='mt-6'>
              <CheckboxItem
                id='active'
                checked={filter.active == 1}
                onCheckedChange={(checked) =>
                  checkBoxChangeHandler('active', checked)
                }
                ariaLabel='Active'
              />
            </div>
            <div className='mt-4'>
              <CheckboxItem
                id='futureAMC'
                checked={filter.futureAMC == 1}
                onCheckedChange={(checked) =>
                  checkBoxChangeHandler('futureAMC', checked)
                }
                ariaLabel='Future AMC'
              />
            </div>
          </div>
          <div className='lg:col-span-2'>
            <InputField
              type='text'
              placeholder='Enter Amc Plan to search'
              onChange={amcPlanSearchChangeHandler}
              // onChange={(e) => inputChangeHandler('searchAmcPlan', e)}
            />
            <div className='mt-6'>
              <CheckboxItem
                id='inactiveAMC'
                checked={filter.inactiveAMC == 1}
                onCheckedChange={(checked) =>
                  checkBoxChangeHandler('inactiveAMC', checked)
                }
                ariaLabel='Inactive AMC'
              />
            </div>
            <div className='mt-4'>
              <CheckboxItem
                id='Archive'
                checked={filter.archive == 1}
                onCheckedChange={(checked) =>
                  checkBoxChangeHandler('archive', checked)
                }
                ariaLabel='Archive'
              />
            </div>
          </div>
          <div className='lg:col-span-2'>
            {/* <SelectBox
              options={branchList}
              value={filter?.selectedBranch}
              onChange={(e) => inputChangeHandler('selectedBranch', e)}
            /> */}
            <div>
              <MultiSelectDropdown
                isMulti={false}
                options={branchList}
                closeMenuOnSelect={true}
                getOptionValue={(option) => option?.id}
                getOptionLabel={(option) => option?.name}
                onChange={(selectedValues: any) =>
                  inputChangeHandler('selectedBranch', selectedValues)
                }
                value={filter?.selectedBranch}
              />
            </div>
            <div className='mt-6'>
              <DatepickerComponent
                label=''
                placeholderText='Enter Start Date to Search'
                dateFormat={'yyyy-MM-dd'}
                onChange={(e) => inputChangeHandler('start_date', e)}
                selectedDate={filter.start_date}
              />
            </div>
          </div>
          <div className='lg:col-span-2'>
            {/* <SelectBox
              options={deviceList}
              value={filter.selectedDevice}
              onChange={(e) => inputChangeHandler('selectedDevice', e)}
            /> */}
            <div>
              <MultiSelectDropdown
                isMulti={false} // or false for single-select
                options={deviceList}
                closeMenuOnSelect={true}
                getOptionValue={(option) => option?.id} // Pass getOptionValue function
                getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
                onChange={(selectedValues: any) =>
                  inputChangeHandler('selectedDevice', selectedValues)
                }
                value={filter?.selectedDevice}
              />
            </div>
            <div className='mt-6'>
              <DatepickerComponent
                label=''
                placeholderText='Enter End Date to Search'
                dateFormat={'yyyy-MM-dd'}
                onChange={(e) => inputChangeHandler('end_date', e)}
                selectedDate={filter.end_date}
              />
            </div>
          </div>
        </div>
        <>
          <div
            className={`col-span-1 flex ${
              activateAMC && !addNewAMC ? '' : 'justify-end'
            } gap-3`}
          >
            {activateAMC && !addNewAMC ? (
              <>
                <Button variant={'outline'} size={'sm'} onClick={onAddNewAMC}>
                  Add new AMC
                </Button>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  onClick={onMultipleTerminateAMCClick}
                >
                  Terminate Multiple AMC
                </Button>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  onClick={onSaveMultipleAMC}
                >
                  Save Multiple AMC
                </Button>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  onClick={onViewSelectedDevice}
                >
                  {`View Selected Devices (${selectedAMCCount})`}
                </Button>
              </>
            ) : (
              (isPBEenterprise || customerData?.is_enterprise == 2) &&
              (addNewAMC ? (
                <Button variant={'outline'} size={'sm'} onClick={onStartNewAMC}>
                  {`Start New AMC (${selectedDeviceCount})`}
                </Button>
              ) : (
                <Button variant={'outline'} size={'sm'} onClick={onActivateAMC}>
                  Activate AMC
                </Button>
              ))
            )}
          </div>
          {addNewAMC ? renderDeviceList() : renderAMCList()}
        </>
      </div>
      {startAMCModal && (
        <StartAMCDialog
          open={startAMCModal}
          onClose={(isRefech, item) => {
            isRenewAMC
              ? onCloseSaveMultipleAMC(isRefech)
              : onStartAMCClick(isRefech, item);
            setFilter((pre) => ({
              ...pre,
              active: 1,
              inactiveAMC: 1,
              archive: 2,
              futureAMC: 2,
            }));
          }}
          startNewAMCDevices={startNewAMCDevices}
          isRenewAMC={isRenewAMC}
          customerData={customerData}
          customerId={id}
          apiBaseUrl={apiBaseUrl}
        />
      )}
      {openAMCInfoModal && (
        <AmcInfoDialog
          open={openAMCInfoModal}
          onClose={() => setOpenAMCinfoModal(false)}
          customerId={id}
          selectedAMCId={selectedAMC.id}
          apiBaseUrl={apiBaseUrl}
          isEnterpriseCustomer={customerData?.is_enterprise}
          helperData={helperData}
        />
      )}

      <ConfirmationDialog
        isOpen={confirmationAction != ''}
        onClose={() => {
          setConfirmationAction('');
          setSelectedAMC(null);
        }}
        buttons={[
          {
            text:
              confirmationAction == ACTION.DELETE
                ? ' I understand the risk and delete this amc.'
                : confirmationAction == ACTION.ARCHIVE
                  ? 'Archive'
                  : 'Terminate',
            variant: 'destructive',
            size: 'sm',
            onClick: AMCAction,
            btnLoading: isLoading,
            icon: isLoading ? <IconLoading /> : '',
          },
        ]}
        ClassName={`${
          confirmationAction == ACTION.DELETE ? 'max-w-[45%]' : null
        }`}
      >
        {confirmationAction == ACTION.DELETE ? (
          <div>
            <div>
              <span>
                Are you sure to want to delete This AMC ? This action is
                irreversible.
              </span>
            </div>
            <div className='p-4'>
              <div>
                * Please type <span className='font-bold'>{`'DELETE ME'`}</span>{' '}
                in the textbox below to proceed.
              </div>
            </div>
            <InputField
              type='text'
              label=''
              placeholder='DELETE ME'
              value={deleteText}
              onChange={(text) => {
                setDeleteText(text);
                setDeleteError('');
              }}
              error={deleteError}
            />
          </div>
        ) : (
          `Do You Really Want to ${
            confirmationAction == ACTION.ARCHIVE ? 'Archive' : 'Terminate'
          } This AMC?`
        )}
      </ConfirmationDialog>
      {/*  multiple action Dialog*/}
      {amcActionModal && (
        <AmcActionDialog
          open={amcActionModal}
          onClose={onAMCActionModalClose}
          lists={multiSelectList}
          apiBaseUrl={apiBaseUrl}
          isViewSelectedDevice={isViewSelectedDevice}
        />
      )}
    </div>
  );
};

export default AmcDetails;
