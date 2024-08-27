'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { DataContext } from '@/context/dataProvider';
import moment from 'moment';
import { Button } from './ui/button';
import CreateServiceReportDialog from './Service Report/CreateServiceReportDialog';
import ServiceReportDialog from './Service Report/ServiceReportDialog';
import ROUTES, {
  COMPLAIN_STATUS,
  REFRESHCOMPLAINDETAIL,
  REFRESHCOMPLAINTLIST,
  REFRESHUNITSERVICELIST,
  SERVICEREPORTLIST,
  extractFileNameFromUrl,
} from '@/utils/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import Link from 'next/link';
import {
  IconBxErrorCircle,
  IconLoading,
  IconMapPin,
  IconPersonFill,
  IconTelephoneFill,
  IconWrench,
} from '@/utils/Icons';
import Loader from './Loader';
import InputField from './InputField';
import { showToast } from './Toast';
import { validateForm } from '@/utils/FormValidationRules';
import CheckboxItem from './CheckboxItem';
import Image from 'next/image';
import useFetchTechnician from '@/hooks/useFetchTechnician';

interface FormData {
  [key: string]: any;
}

const ComplainsDetails = ({ customerId, reportId, apiBaseUrl }: any) => {
  const { state, setData } = useContext(DataContext);
  const [complaintDetail, setComplaintDetail] = useState(
    state?.setComplaintDetail || {}
  );
  // const [technicianList, setTechnicianList] = useState<FormData | undefined>();
  const [reportListList, setReportList] = useState<FormData | undefined>();
  const [selectedReport, setSelectedReport] = useState<any>({});
  const [serviceUnitHistoryList, setServiceUnitHistoryList] = useState<
    FormData | undefined
  >();
  const [billingformData, setBillingFormData] = useState<FormData | undefined>({
    billing_amount: null,
    invoice: null,
    payment_mode: null,
    payment_status: 2,
  });
  const [openCreateServiceReportDialog, setOpenCreateServiceReportDialog] =
    useState(false);
  const [openServiceReportDialog, setOpenServiceReportDialog] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isupdateLoading, setUpdateLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  const [errors, setErrors] = useState<FormData>();
  const [showPartsRequested, setShowPartsRequested] = useState(false);

  useEffect(() => {
    fetchReportList();
  }, [state?.[REFRESHCOMPLAINTLIST]]);

  const fetchReportList = async () => {
    try {
      setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/request/${reportId}/service-report?need_all=1`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setReportList(response?.data);
      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const fetchReportDetail = async (report: any) => {
    try {
      setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/request/${report?.request_id}/service-report/${report?.id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      // setReportList(response?.data);
      setSelectedReport(response?.data);
      setOpenServiceReportDialog(true);

      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const fetchComplaintDetail = async () => {
    try {
      setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/request/${reportId}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setComplaintDetail(response?.data || {});
      setBillingFormData({
        id: response?.data.billing_detail?.id,
        billing_amount: response?.data.billing_detail?.billing_amount || null,
        invoice: response?.data.billing_detail?.invoice || null,
        payment_mode: 1,
        payment_status: response?.data.billing_detail?.payment_status || 1,
        payment_reference:
          response?.data.billing_detail?.payment_reference || '',
      });
      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const fetchServiceUnitHistory = async () => {
    try {
      setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${customerId}/request/${reportId}/service-report/history?need_all=1`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setServiceUnitHistoryList(response?.data || []);
      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const getReportDetail = async (report: any) => {
    fetchReportDetail(report);
  };

  const handleInputChange = async (key: string, value: any) => {
    if (key === 'invoice' && value.target.files) {
      const file = value.target.files[0];
      setBillingFormData((prevData) => ({ ...prevData, [key]: file }));
    } else {
      setBillingFormData((prevData) => ({ ...prevData, [key]: value }));
    }
  };

  const createBilling = async () => {
    try {
      // Start the loading state
      setLoading(true);
      // Validation
      const formData = new FormData();

      const validationRules = [
        {
          field: 'billing_amount',
          value: billingformData?.billing_amount,
          message: 'Total Amount',
        },
        {
          field: 'invoice',
          value: billingformData?.invoice,
          message: 'invoice',
        },
        // Add more validation rules as needed
      ];

      let { isError, errors } = validateForm(validationRules);
      if (isError) {
        setErrors(errors);
      } else {
        formData.append('invoice', billingformData?.invoice);
        formData.append('billing_amount', billingformData?.billing_amount);
        formData.append('request_id', complaintDetail?.id);

        let apiUrl = apiBaseUrl.CUSTOMERS;

        const technician = {
          endpoint: `${apiUrl}/${complaintDetail.customer_id}/billing`,
          method: 'POST',
          body: formData,
          isFormData: true,
        };
        const response = await apiAction.mutateAsync(technician);

        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setBillingFormData({});
          fetchComplaintDetail();
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

  const updateBullingReport = async () => {
    try {
      // Start the loading state
      setUpdateLoading(true);
      // Validation
      const validationRules = [
        {
          field: 'payment_mode',
          value: billingformData?.payment_mode,
          message: 'Payment Mode',
        },
        {
          field: 'payment_reference',
          value: billingformData?.payment_reference,
          message: 'Payment Reference',
        },
        // Add more validation rules as needed
      ];

      let { isError, errors } = validateForm(validationRules);
      if (isError) {
        setErrors(errors);
      } else {
        const payload = {
          payment_mode: billingformData?.payment_mode ? 1 : 0,
          payment_reference: billingformData?.payment_reference,
          request_id: complaintDetail?.id,
          payment_status: 1,
        };

        let apiUrl = apiBaseUrl.CUSTOMERS;

        const technician = {
          endpoint: `${apiUrl}/${complaintDetail.customer_id}/billing/${billingformData?.id}?_method=patch`,
          method: 'POST',
          body: payload,
        };
        const response = await apiAction.mutateAsync(technician);

        if (response?.isError) {
          setErrors(response.errors);
        } else {
          setErrors({});
          setBillingFormData({});
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
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetail();
  }, [state?.[REFRESHCOMPLAINDETAIL]]);

  useEffect(() => {
    fetchServiceUnitHistory();
  }, [state?.[REFRESHUNITSERVICELIST]]);

  return (
    <div className='flex h-full grow flex-col overflow-hidden md:flex-row'>
      <div className='h-full flex-grow p-6 md:p-5'>
        <div className='flex h-full flex-col gap-5 bg-white p-5'>
          <ScrollArea>
            <div className='grow  overflow-auto pr-5'>
              <div className='grid grid-cols-4 gap-20 pb-10'>
                <div className=''>
                  <h2 className='mb-2 text-lg font-bold capitalize'>
                    {complaintDetail?.customer?.name}
                  </h2>
                  <div className='flex flex-col gap-1 capitalize'>
                    {complaintDetail?.customer?.address_1 ? (
                      <p className='font-medium'>
                        {complaintDetail?.customer?.address_1},
                      </p>
                    ) : null}

                    {complaintDetail?.customer?.address_2 ? (
                      <p className='font-medium'>
                        {complaintDetail?.customer?.address_2},
                      </p>
                    ) : null}

                    {complaintDetail?.customer?.address_3 ? (
                      <p className='font-medium'>
                        {complaintDetail?.customer?.address_3},
                      </p>
                    ) : null}

                    {complaintDetail?.customer?.city?.name ? (
                      <p className='flex font-medium'>
                        <span>{complaintDetail?.customer?.city?.name}</span> -{' '}
                        <span> {complaintDetail?.customer?.zip}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className='flex items-center gap-1 py-1'>
                    <div className='text-sm font-bold'>
                      {moment(complaintDetail?.created_at).format(
                        'DD MMMM, YYYY'
                      )}
                    </div>
                    <span className='text-xs'>
                      ({moment(complaintDetail?.created_at).format('dddd')})
                    </span>
                  </div>
                  <div className='text-sm font-bold'>
                    {moment(complaintDetail?.created_at).format('hh:mm A')}
                  </div>
                </div>
                <div>
                  <h2 className='mb-2 text-lg font-bold capitalize'>
                    BRANCH ADDRESS
                  </h2>
                  <div className='flex flex-col gap-1 capitalize'>
                    {complaintDetail?.device?.branch?.address_1 ? (
                      <p className='font-medium'>
                        {complaintDetail?.device?.branch?.address_1},
                      </p>
                    ) : null}

                    {complaintDetail?.device?.branch?.address_2 ? (
                      <p className='font-medium'>
                        {complaintDetail?.device?.branch?.address_2},
                      </p>
                    ) : null}

                    {complaintDetail?.device?.branch?.address_3 ? (
                      <p className='font-medium'>
                        {complaintDetail?.device?.branch?.address_3},
                      </p>
                    ) : null}

                    {complaintDetail?.device?.branch?.city?.name ? (
                      <p className='font-medium'>
                        {complaintDetail?.device?.branch?.city?.name}
                      </p>
                    ) : null}

                    <div className='flex gap-1'>
                      <span className='font-bold'>Device: </span>
                      <p className='font-medium'>
                        {complaintDetail?.device?.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-5'>
                  <div>
                    <h2 className='text-lg font-bold capitalize'>
                      Complaint Type
                    </h2>
                    <p>{complaintDetail?.request_type?.name}</p>
                  </div>
                  <div>
                    <h2 className='text-lg font-bold capitalize'>
                      Complaint Status
                    </h2>
                    <p>{complaintDetail?.request_status?.name}</p>
                  </div>
                </div>

                <div className='flex flex-col gap-5'>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    className='max-w-[170px]'
                    onClick={() => setOpenServiceReportDialog(true)}
                  >
                    Service Report
                  </Button>
                  {/* display create service report button if complain status is not closed*/}
                  {complaintDetail?.request_status_id !=
                  COMPLAIN_STATUS.CLOSED ? (
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      className='max-w-[170px]'
                      onClick={() => setOpenCreateServiceReportDialog(true)}
                    >
                      Create Report
                    </Button>
                  ) : null}
                </div>
              </div>
              {complaintDetail.request_status_id === COMPLAIN_STATUS.WAITING_FOR_PARTS && (
                <div className='border-b border-t py-10'>
                  <div className='mb-5 grid grid-cols-4 items-center '>
                    <div className='text-xl font-semibold text-yellowButton-default'>
                      Parts Requested{' '}
                    </div>
                    <div>
                      {complaintDetail.billing_detail &&
                        complaintDetail?.billing_detail?.payment_status ==
                          2 && (
                          <CheckboxItem
                            checked={showPartsRequested}
                            onCheckedChange={(checked) =>
                              setShowPartsRequested(checked)
                            }
                            ariaLabel={'Paid'}
                            id={`is_paid`}
                          />
                        )}
                    </div>
                  </div>
                  <div className='mb-2  block font-semibold'>
                    Enter Total Amount:
                  </div>
                  <div className='grid grid-cols-3 items-start gap-6 md:grid-cols-4'>
                    <div>
                      <InputField
                        type='number'
                        label=''
                        size='sm'
                        value={billingformData?.billing_amount || ''}
                        onChange={(e) => handleInputChange('billing_amount', e)}
                        error={errors?.billing_amount || ''}
                        disabled={complaintDetail.billing_detail}
                      />
                    </div>
                    <div>
                      <InputField
                        type='file'
                        accept='image/*'
                        size='sm'
                        onChange={(e) => handleInputChange('invoice', e)}
                        className={'w-full'}
                        error={errors?.invoice || ''}
                        disabled={complaintDetail.billing_detail}
                      />
                    </div>
                    <div>
                      {complaintDetail.billing_detail ? (
                        <div className='flex flex-col gap-5'>
                          <div>
                            <Button
                              variant={'outline'}
                              size={'sm'}
                              className='min-w-[10rem]'
                              onClick={() => createBilling()}
                              icon={isLoading && <IconLoading />}
                              disabled={isLoading || complaintDetail.billing_detail}
                            >
                              Send Reminder
                            </Button>
                          </div>
                          <div>
                            <Link
                              className='break-words font-semibold uppercase text-pbHeaderBlue'
                              href={billingformData?.invoice}
                              target='_blank'
                            >
                              {extractFileNameFromUrl(billingformData?.invoice)}
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant={'outline'}
                          size={'sm'}
                          className='min-w-[10rem]'
                          onClick={() => createBilling()}
                          icon={isLoading && <IconLoading />}
                          disabled={isLoading}
                        >
                          Notify Customer
                        </Button>
                      )}
                    </div>
                  </div>
                  {showPartsRequested && (
                    <div className='my-5 grid grid-cols-3 items-end gap-6 border-y py-5 md:grid-cols-4'>
                      <div className=''>
                        <div className='flex gap-4'>
                          <CheckboxItem
                            checked={billingformData?.payment_mode}
                            onCheckedChange={(checked) =>
                              handleInputChange('payment_mode', checked)
                            }
                            ariaLabel={'Cheque'}
                            id={`is_cheque`}
                          />
                          <CheckboxItem
                            onCheckedChange={(checked) =>
                              handleInputChange('payment_mode', checked)
                            }
                            ariaLabel={'PayU'}
                            id={`is_payu`}
                            disabled={true}
                          />
                        </div>
                        {errors && (
                          <div className='mt-1 text-xs text-pbHeaderRed'>
                            {errors.payment_mode}
                          </div>
                        )}{' '}
                      </div>
                      <div>
                        <InputField
                          type='text'
                          label='Payment Detail'
                          placeholder='Enter Reference Number'
                          size='sm'
                          value={billingformData?.payment_reference || ''}
                          onChange={(e) =>
                            handleInputChange('payment_reference', e)
                          }
                          error={errors?.payment_reference || ''}
                        />
                      </div>

                      <div>
                        <Button
                          size={'sm'}
                          className='min-w-[10rem] uppercase'
                          onClick={() => updateBullingReport()}
                          icon={isupdateLoading && <IconLoading />}
                          disabled={isupdateLoading}
                        >
                          update
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className='py-8'>
                <Accordion
                  type='single'
                  collapsible
                  className='flex flex-col gap-5'
                >
                  <AccordionItem
                    value={`main-item-p`}
                    className='rounded-md border px-4 no-underline'
                  >
                    <AccordionTrigger className='text-left hover:no-underline'>
                      <div className='grid w-full items-center'>
                        <h3 className='text-xl font-semibold'>Unit History</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='divide-y-2'>
                      {serviceUnitHistoryList &&
                        serviceUnitHistoryList?.map(
                          (report: any, Index: number) => {
                            return (
                              <div
                                key={Index}
                                className='grid grid-cols-5 justify-around py-6 pr-4'
                              >
                                <div className='flex flex-col gap-5'>
                                  <div className='text-sm font-bold'>
                                    Report No. :{' '}
                                    <span className='text-xs font-normal'>
                                      {report.id}
                                    </span>
                                  </div>
                                </div>
                                <div className='flex flex-col gap-8'>
                                  <div className='text-sm font-bold'>
                                    Report Date. :{' '}
                                    <span className='text-xs font-normal'>
                                      {moment(report?.created_at).format(
                                        'DD MMMM, YYYY'
                                      )}{' '}
                                    </span>
                                  </div>
                                </div>
                                <div className='flex flex-col gap-8'>
                                  <div className='flex'>
                                    <IconWrench className='mr-3 h-5 w-5' />
                                    {report?.technician?.name}
                                  </div>
                                </div>
                                <div className='flex flex-col gap-8'>
                                  <div className='text-sm font-bold'>
                                    Complaint Status :{' '}
                                    <span className=' font-normal'>
                                      {
                                        report?.customer_request?.request_status
                                          ?.name
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className='flex flex-col gap-8 '>
                                  <div className='flex justify-end'>
                                    <Button
                                      variant={'outline'}
                                      size={'sm'}
                                      className='min-w-[10rem]'
                                      onClick={() => getReportDetail(report)}
                                    >
                                      Service Report
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
      {openCreateServiceReportDialog && (
        <CreateServiceReportDialog
          open={openCreateServiceReportDialog}
          onClose={() => {
            setOpenCreateServiceReportDialog(false);
          }}
          apiBaseUrl={apiBaseUrl}
          complaintDetail={complaintDetail}
        />
      )}
      {openServiceReportDialog && (
        <ServiceReportDialog
          open={openServiceReportDialog}
          onClose={() => {
            setOpenServiceReportDialog(false), setSelectedReport({});
          }}
          apiBaseUrl={apiBaseUrl}
          complaintDetail={complaintDetail}
          reportListList={
            selectedReport?.id ? [selectedReport] : reportListList
          }
        />
      )}
      {fetchLoading ? <Loader /> : null}
    </div>
  );
};

export default ComplainsDetails;
