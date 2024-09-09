import React, { FC, useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ROUTES, {
  YYYYMMDD,
  extractFileNameFromUrl,
  getAMCServiceStatus,
  getBaseUrl,
  getStatusString,
} from '@/utils/utils';
import moment from 'moment';
import SelectBox from '../SelectBox';
import ListGroupItem from '../ListGroupItem';
import AddressField from '../AddressEditableField';
import { showToast } from '../Toast';
import { usePathname } from 'next/navigation';
import ServiceReportDialog from '../Service Report/ServiceReportDialog';
import Loader from '../Loader';

interface AmcInfoDialogProps {
  open: boolean;
  onClose?: () => void;
  customerId: string | string[];
  apiBaseUrl: any;
  selectedAMCId: any;
  helperData: any;
  isEnterpriseCustomer?: number;
}

interface FormData {
  [key: string]: any;
}

const AmcInfoDialog: FC<AmcInfoDialogProps> = ({
  open,
  onClose,
  customerId,
  apiBaseUrl,
  selectedAMCId,
  helperData,
  isEnterpriseCustomer,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [amcInfo, setAMCinfo] = useState<FormData>();
  const apiAction = useMutation(apiCall);
  const [statusString, className] = getStatusString(amcInfo?.is_active);
  const [selectedItem, setselectedItem] = useState<FormData[]>([]); // Initialize as an empty array
  const [errors, setErrors] = useState<FormData>();
  const [openServiceReportDialog, setOpenServiceReportDialog] = useState(false);
  const [selectedComplain, setSelectedComplain] = useState({});
  const [reportListList, setReportList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const pathName = usePathname();
  const basePath = getBaseUrl(pathName);
  const isPBEenterprise = basePath == ROUTES.PBENTERPRISE;
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  useEffect(() => {
    fetchAMCInfo();
  }, []);

  const fetchAMCInfo = async () => {
    try {
      const fetchDeviceList = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/amc/${selectedAMCId}/info`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchDeviceList);
      setAMCinfo(data);
      setselectedItem(data?.amc_service);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleInputChange = (id: number, key: string, value: string) => {
    // Find the index of the object with the matching ID
    const index = selectedItem.findIndex((item) => item.id === id);
    // If the object with the matching ID is found
    if (index !== -1) {
      // Create a copy of the selectedItem array
      const updatedSelectedItem = [...selectedItem];

      // Create a copy of the object at the found index
      const selectedItemToUpdate = { ...updatedSelectedItem[index] };

      // Update the value of the specified key in the selected item
      selectedItemToUpdate[key] = value;

      // Update the selectedItem array with the modified item
      updatedSelectedItem[index] = selectedItemToUpdate;

      // Set the updated selectedItem state
      setselectedItem(updatedSelectedItem);
    }
  };

  const onSaveServiceType = async () => {
    // Create new objects with specific keys and values
    const newObjects = selectedItem.map(({ id, amc_service_type_id }) => ({
      service_id: id,
      service_type_id: amc_service_type_id,
    }));
    const params = {
      amc_service_type: newObjects,
    };
    try {
      // Start the loading state
      setLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/amc/${selectedAMCId}/update-service-type`,
        method: 'PATCH',
        body: params,
      };
      const response = await apiAction.mutateAsync(data);

      if (response?.isError) {
        setErrors(response.errors);
      } else {
        onClose?.();
        setErrors({});
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

  const fetchReportList = async (complain: any) => {
    try {
      setSelectedComplain({
        ...complain,
        customer_id: customerId,
      });
      setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/request/${complain?.id}/service-report?need_all=1`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setReportList(response?.data);
      setFetchLoading(false);
      setOpenServiceReportDialog(true);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const hasRequest = selectedItem?.some(
    (service: any) => service.request !== null
  );

  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Amc Info'
      ClassName='sm:max-w-[95%] h-full grow max-h-[95%]'
    >
      <ScrollArea className='grow'>
        <div className='flex grow flex-col gap-4 overflow-auto p-4'>
          <Card className=''>
            <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
              <CardTitle className='text-lg font-normal'>
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <div className='grid divide-y-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Customer Id :'
                    value={amcInfo?.customer?.id}
                    loading={!amcInfo}
                  />

                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Customer Name :'
                    value={amcInfo?.customer?.name}
                    loading={!amcInfo}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Contact number :'
                    value={amcInfo?.customer?.phone}
                    loading={!amcInfo}
                  />
                  <div className='grid grid-cols-2 gap-4 py-4'>
                    <AddressField
                      label='Address Details :'
                      selectedformData={amcInfo?.customer}
                      loading={!amcInfo}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className=''>
            <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
              <CardTitle className='text-lg font-normal'>Amc Details</CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <div className='grid divide-y-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Device Name :'
                    value={amcInfo?.device?.name}
                    loading={!amcInfo}
                  />

                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Amc Plan :'
                    value={amcInfo?.amc_plan?.amc_code}
                    loading={!amcInfo}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4 py-3'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='font-bold uppercase'>AMC Description :</div>
                    <div className='uppercase'>
                      {amcInfo?.amc_plan?.amc_description}
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Nos of Days :'
                    value={amcInfo?.amc_plan?.no_of_days}
                    loading={!amcInfo}
                  />
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Services in Year :'
                    value={amcInfo?.amc_plan?.services_in_year}
                    loading={!amcInfo}
                  />
                </div>
                {isPBPartner && isEnterpriseCustomer == 1 ? null : (
                  <div className='grid grid-cols-2 gap-4'>
                    <ListGroupItem
                      className='grid grid-cols-2 gap-4'
                      label='Amount :'
                      value={amcInfo?.amount}
                      loading={!amcInfo}
                    />
                    <ListGroupItem
                      className='grid grid-cols-2 gap-4'
                      label='Discount :'
                      value={amcInfo?.discount}
                      loading={!amcInfo}
                    />
                  </div>
                )}
                <div className='grid grid-cols-2 gap-4'>
                  {isPBPartner && isEnterpriseCustomer == 1 ? null : (
                    <ListGroupItem
                      className='grid grid-cols-2 gap-4'
                      label='Final Amount :'
                      value={amcInfo?.discount}
                      loading={!amcInfo}
                    />
                  )}
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='Status :'
                    value={statusString}
                    loading={!amcInfo}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='StartDate :'
                    value={moment(amcInfo?.start_date).format(YYYYMMDD)}
                    loading={!amcInfo}
                  />
                  <ListGroupItem
                    className='grid grid-cols-2 gap-4'
                    label='EndDate :'
                    value={moment(amcInfo?.end_date).format(YYYYMMDD)}
                    loading={!amcInfo}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {!amcInfo?.terminated_date && (
            <Card className=''>
              <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                <CardTitle className='text-lg font-normal'>
                  Service Dates
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='rounded border-2'>
                  <div className='grid divide-y-2'>
                    <div className='grid grid-cols-12 gap-4 divide-x-2'>
                      <div className='col-span-2 p-3  font-semibold'>#</div>
                      <div className='col-span-3 p-3 font-semibold'>
                        Device Name{' '}
                      </div>
                      <div className='col-span-7 p-3 font-semibold'>
                        Service Dates
                      </div>
                    </div>
                    <div className='grid grid-cols-12 gap-4 divide-x-2'>
                      <div className='col-span-2 p-3'>
                        {amcInfo?.device?.id}
                      </div>
                      <div className='col-span-3 p-3'>
                        {amcInfo?.device?.name}
                      </div>
                      <div className='col-span-7 grid grid-cols-3 gap-3 p-3'>
                        {selectedItem?.map((item: any, index: number) => (
                          <div key={index}>
                            <div className='mb-2 flex items-center gap-2'>
                              <span
                                className={`h-3 w-3 rounded-full`}
                                style={{
                                  backgroundColor: getAMCServiceStatus(
                                    item?.request
                                  ),
                                }}
                              ></span>
                              {moment(item?.service_date).format(YYYYMMDD)}
                            </div>
                            {/* {!isPBEenterprise && ( */}
                              <SelectBox
                                isRequired
                                disabled={
                                  // isEnterpriseCustomer == 1 ||
                                  item?.request != null
                                }
                                label=''
                                options={helperData?.data?.amc_service_type}
                                value={item?.amc_service_type_id || ''}
                                onChange={(e) =>
                                  handleInputChange(
                                    item.id,
                                    'amc_service_type_id',
                                    e
                                  )
                                }
                              />
                            {/* )} */}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* {isPBEenterprise || isEnterpriseCustomer == 1 ? null : ( */}
                      <div className='grid grid-cols-12 gap-4 divide-x-2'>
                        <div className='col-span-2 p-3'></div>
                        <div className='col-span-3 p-3'></div>
                        <div className='col-span-7 col-start-6 flex justify-center gap-4 p-3'>
                          <Button
                            size={'sm'}
                            className='min-w-[85px]'
                            onClick={onSaveServiceType}
                            icon={isLoading && <IconLoading />}
                            disabled={isLoading}
                          >
                            Save
                          </Button>
                          <Button
                            size={'sm'}
                            className='min-w-[85px]'
                            variant={'outline'}
                            onClick={onClose}
                          >
                            cancel
                          </Button>
                        </div>
                      </div>
                    {/* )} */}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {hasRequest && (
            <Card className=''>
              <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                <CardTitle className='text-lg font-normal'>
                  Service History
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='rounded border-2'>
                  <div className='grid divide-y-2'>
                    <div className='grid grid-cols-12 gap-4 divide-x-2'>
                      <div className='col-span-2 p-3  font-semibold'>#</div>
                      <div className='col-span-3 p-3 font-semibold'>
                        Device Name
                      </div>
                      <div className='col-span-7 p-3 font-semibold'>
                        Service Dates
                      </div>
                    </div>
                    <div className='grid grid-cols-12 gap-4 divide-x-2'>
                      <div className='col-span-2 p-3'>
                        {amcInfo?.device?.id}
                      </div>
                      <div className='col-span-3 p-3'>
                        {amcInfo?.device?.name}
                      </div>
                      <div className='col-span-7 grid grid-cols-3 gap-3 p-3'>
                        {selectedItem?.map((item: any, index: number) => {
                          if (item?.request?.created_at == undefined) return;
                          return (
                            <div key={index}>
                              <div
                                className='mb-2 cursor-pointer text-pbHeaderBlue'
                                onClick={() => fetchReportList(item?.request)}
                              >
                                {moment(item?.request?.created_at).format(
                                  YYYYMMDD
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isPBPartner && isEnterpriseCustomer == 1 ? null : (
            <Card className=''>
              <CardHeader className='bg-primary px-4 py-2 text-primary-foreground'>
                <CardTitle className='text-lg font-normal'>
                  Quotation History
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='rounded border-2'>
                  <div className='grid divide-y-2'>
                    <div className='grid grid-cols-7 gap-4 divide-x-2'>
                      <div className='p-3  font-semibold'>#</div>
                      <div className='p-3 font-semibold'>Quotation Date </div>
                      <div className='p-3 font-semibold'>Amount</div>
                      <div className='p-3 font-semibold'>Discount</div>
                      <div className='p-3 font-semibold'>Final Amount </div>
                      <div className='p-3 font-semibold'>Status</div>
                      <div className='p-3 font-semibold'>File</div>
                    </div>

                    {amcInfo?.amc_quotation?.map(
                      (quotation: any, index: number) => (
                        <div
                          key={quotation.id}
                          className='grid grid-cols-7 gap-4 divide-x-2'
                        >
                          <div className='p-3'>{quotation?.id}</div>
                          <div className='p-3'>
                            {moment(quotation.quotation_date).format(
                              'YYYY-MM-DD HH:mm:ss'
                            )}
                          </div>
                          <div className='p-3'>{quotation.amount}</div>
                          <div className='p-3'>{quotation.discount}</div>
                          <div className='p-3'>
                            {quotation.amount - quotation.discount}
                          </div>
                          <div className='p-3'>
                            {quotation.is_confirmed == 1
                              ? 'Approved'
                              : 'Pending'}
                          </div>
                          <div className='p-3'>
                            {quotation?.quotation && (
                              <Link
                                className='break-words font-semibold text-pbHeaderBlue'
                                href={extractFileNameFromUrl(
                                  quotation.quotation,
                                  true
                                )}
                                target='_blank'
                              >
                                {extractFileNameFromUrl(quotation.quotation)}
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
      {openServiceReportDialog && (
        <ServiceReportDialog
          open={openServiceReportDialog}
          onClose={() => {
            setOpenServiceReportDialog(false);
            setSelectedComplain({});
          }}
          apiBaseUrl={apiBaseUrl}
          complaintDetail={selectedComplain}
          reportListList={reportListList}
        />
      )}
      {fetchLoading ? <Loader /> : null}
    </MyDialog>
  );
};

export default AmcInfoDialog;
