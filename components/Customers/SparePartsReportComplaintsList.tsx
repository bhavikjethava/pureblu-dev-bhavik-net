import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '@/context/dataProvider';
import { useMutation } from 'react-query';
import { apiCall, downloadFile } from '@/hooks/api';
import { ScrollArea } from '../ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import {
  IconBxErrorCircle,
  IconDownload,
  IconExternalLink,
  IconLoading,
  IconMapPin,
  IconPersonFill,
  IconSearch,
  IconTelephoneFill,
  IconWrench,
} from '@/utils/Icons';
import { useParams, usePathname } from 'next/navigation';
import ComplaintsListItem from '../ComplaintsListItem';
import DatepickerComponent from '../DatePicker';
import { showToast } from '../Toast';
import InputField from '../InputField';
import ROUTES, {
  BRANCHLIST,
  CUSTOMER,
  DATE_FORMAT_FULL_DATE_TIME,
  DDMMYYYY,
  DEVICELIST,
  OptionType,
  REFRESHCOMPLAINTLIST,
  SKILLLIST,
  accountTypeRender,
  deleteArrayItem,
  getBaseUrl,
  updateArray,
} from '@/utils/utils';
import moment from 'moment';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import useFetchComplaints from '@/hooks/useFetchComplaints';
import Link from 'next/link';
import SelectBox from '../SelectBox';
import { API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';
import { validateForm } from '@/utils/FormValidationRules';
import { Skeleton } from '../ui/skeleton';
import { ERROR_MESSAGES } from '@/utils/ValidationUtils';

interface FormData {
  [key: string]: any;
}

const SparePartsReportComplaintsList = ({
  apiBaseUrl,
  isTechnician,
  isPastComplaints,
  isManageServiceReport,
  isSparePartsReport,
}: any) => {
  const [filteredComplaintList, setFilteredComplainList] = useState<
    Array<FormData>
  >([]);
  const { state, setData } = useContext(DataContext);
  const apiAction = useMutation(apiCall);
  const { id } = useParams();
  const [selectedComplaint, setselectedComplaint] = useState<FormData>();
  const [errors, setErrors] = useState<FormData>();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [complaintList, setComplaintList] = useState<Array<any>>([]);
  const [complaintLoading, setComplaintLoading] = useState(false);

  const [searchComplaintsTerm, setSearchComplaintsTerm] = useState<string>('');
  const [parentList, setParentList] = useState<Array<object> | undefined>();
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<any>({});
  const [fetchLoading, setFetchLoading] = useState(false);

  const [searchData, setSearchData] = useState<{ [Key: string]: any }>({
    search: '',
    from: null,
    to: null,
  });

  const [displayLimit, setDisplayLimit] = useState<number>(8); // State variable to control the number of records to display

  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchComplaints = async () => {
    setComplaintLoading(true);
    try {
      let validationRules: any = [];

      if (selectedPartner === 'all') {
        validationRules = [
          {
            field: 'from',
            value: searchData?.from,
            customMessage: 'Please select From Date',
          },
          {
            field: 'to',
            value: searchData?.to,
            customMessage: 'Please select To Date',
          },
        ];
      }

      let { isError, errors } = validateForm(validationRules);
      if (
        !isError &&
        moment(searchData?.to).isBefore(moment(searchData?.from))
      ) {
        errors['to'] = ERROR_MESSAGES.fromDateGreater;
        isError = true;
      }

      if (isError) {
        setErrors(errors);
      } else {
        setErrors({});
        let endpoint = `${apiBaseUrl.SPARE_PARTS_REPORT}?need_all=1`;

        const fromDate = searchData.from
          ? moment(searchData.from).format('Y-MM-DD')
          : '';
        const toDate = searchData.to
          ? moment(searchData.to).format('Y-MM-DD')
          : '';

        const searchParam = searchData.search
          ? `&search=${searchData.search}`
          : '';

        let dateParams = '';
        if (fromDate) {
          dateParams += `&from=${fromDate}`;
        }
        if (toDate) {
          dateParams += `&to=${toDate}`;
        }

        endpoint = `${apiBaseUrl.SPARE_PARTS_REPORT}?need_all=1${dateParams}${searchParam}`;
        if (selectedPartner) {
          endpoint += `&partner_id=${selectedPartner}`;
        }

        const fetchComplaintsData = {
          endpoint,
          method: isSparePartsReport ? 'POST' : 'GET',
        };
        const { data } = await apiAction.mutateAsync(fetchComplaintsData);
        setComplaintList(data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setComplaintLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const partner = {
        endpoint: `${API_ENDPOINTS_ENTERPRISE.PARTNER}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(partner);
      const modifiedData = [{ id: 'all', name: 'All Partners' }, ...data];

      setParentList(modifiedData);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  useEffect(() => {
    let filteredData;
    if (searchComplaintsTerm.trim() === '') {
      // If search term is empty, set filtered data to the original complaint list
      filteredData = complaintList;
    } else {
      // If search term is not empty, filter the complaint list based on the search term
      filteredData = complaintList.filter((complaint) => {
        // Filter through each request object to find the one with matching date range
        const requestInRange = complaint.request.find((requestItem: any) => {
          // Check if any value in requestItem contains the search term
          return Object.values(requestItem as { [key: string]: unknown }).some(
            (value) =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        return requestInRange !== undefined; // Return true if any request matches the search term
      });
    }

    // Set the filtered data to state
    setFilteredComplainList(filteredData);
  }, [searchComplaintsTerm, complaintList]);

  const onSearchClcik = () => {
    fetchComplaints();
  };

  const onSearchChangeHandler = (field: string, value: any) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  // Function to handle click event to load more records
  const handleLoadMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + 10); // Increase the display limit by 10
  };

  const onExportClick = async () => {
    setLoading(true);

    try {
      let validationRules: any = [];

      if (selectedPartner === 'all') {
        validationRules = [
          {
            field: 'from',
            value: searchData?.from,
            customMessage: 'Please select From Date',
          },
          {
            field: 'to',
            value: searchData?.to,
            customMessage: 'Please select To Date',
          },
        ];
      }

      let { isError, errors } = validateForm(validationRules);
      if (
        !isError &&
        moment(searchData?.to).isBefore(moment(searchData?.from))
      ) {
        errors['to'] = ERROR_MESSAGES.fromDateGreater;
        isError = true;
      }

      const fromDate = searchData?.from
        ? moment(searchData?.from).format('Y-MM-DD')
        : null;
      const toDate = searchData?.to
        ? moment(searchData?.to).format('Y-MM-DD')
        : null;

      if (isError) {
        setErrors(errors);
      } else {
        setErrors({});
        let endpoint: string = `${apiBaseUrl.EXPORT_SPARE_PARTS}?partner_id=${selectedPartner}`;

        if (fromDate) {
          endpoint += `&from=${fromDate}`;
        }
        if (toDate) {
          endpoint += `&to=${toDate}`;
        }

        const blob: Blob = await downloadFile(endpoint);

        const blobUrl: string = window.URL.createObjectURL(blob);

        const a: HTMLAnchorElement = document.createElement('a');
        a.href = blobUrl;
        a.download = `SparePartsReport-${selectedPartner}.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to download service report:', error);
      // Handle error gracefully (e.g., display a message to the user)
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle partner selection
  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setErrors({});
  };

  return (
    <div className='flex w-full flex-col  gap-5 overflow-hidden'>
      <div className='grid w-full grid-cols-3 items-center gap-5 bg-white p-5'>
        <SelectBox
          label=''
          value={selectedPartner} // Set the value of the selected partner
          options={parentList}
          onChange={(partnerId: string) => handlePartnerChange(partnerId)}
        />
        <div className='grid grid-cols-2 gap-5'>
          <DatepickerComponent
            label=''
            placeholderText='From'
            dateFormat='dd/MM/yyyy'
            error={errors?.from || ''}
            onChange={(value: any) => onSearchChangeHandler('from', value)}
            selectedDate={searchData.from}
          />
          <DatepickerComponent
            label=''
            placeholderText='To'
            dateFormat='dd/MM/yyyy'
            error={errors?.to || ''}
            onChange={(value: any) => onSearchChangeHandler('to', value)}
            selectedDate={searchData.to}
          />
        </div>
        <div className='grid grid-cols-2 gap-5'>
          <Button
            variant={'blue'}
            className='!w-full'
            onClick={onSearchClcik}
            icon={<IconSearch className='h-4 w-4 text-white' />}
          >
            Search
          </Button>
          <div>
            {(selectedPartner !== 'all' ||
              (searchData.from && searchData.to)) && (
              <Button
                variant={'blue'}
                className='!w-full'
                onClick={onExportClick}
                disabled={loading}
                icon={loading ? <IconLoading /> : ''}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className='bg-pbHeaderBlue py-3 pr-4 text-white'>
        <div className='grid w-full grid-cols-12 items-center justify-between  gap-4 px-4'>
          <div className='col-span-2 font-bold'>Complaint Created</div>
          <div className='col-span-2 font-bold'>Complaint Id</div>
          <div className='col-span-2 font-bold'>Partner</div>
          <div className='col-span-2 font-bold'>Customer</div>
          <div className='col-span-2 font-bold'>Spare Parts Requested</div>
          <div className='col-span-2 font-bold'>
            <span>Note</span> <span className='flex w-3'></span>
          </div>
        </div>
      </div>
      <ScrollArea>
        <div className='grow  overflow-auto'>
          <Accordion type='single' collapsible className='flex flex-col gap-5'>
            {complaintLoading ? (
              <>
                {Array.from({ length: 8 }, (_, index) => (
                  <>
                    <Skeleton key={index} className='min-h-[56px] w-full' />{' '}
                  </>
                ))}
              </>
            ) : (
              <>
                {complaintList &&
                  complaintList
                    ?.slice(0, displayLimit)
                    ?.map((complaint: any, deviceIndex: number) => {
                      return (
                        <AccordionItem
                          key={deviceIndex}
                          value={`main-item-${deviceIndex}`}
                          className='rounded-md border-none bg-white px-4 no-underline'
                        >
                          <AccordionTrigger className='text-left hover:no-underline'>
                            <div className='grid w-full grid-cols-12 items-center justify-between gap-4'>
                              <div className='col-span-2 flex items-center gap-5 capitalize'>
                                <div className='flex flex-col'>
                                  <div className='text-sm font-bold'>
                                    {moment(complaint?.assign_date).format(
                                      DATE_FORMAT_FULL_DATE_TIME
                                    )}
                                  </div>
                                  <span className='text-xs'>
                                    {moment(complaint?.created_at).format(
                                      'dddd'
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className='col-span-2'>
                                {complaint?.complain_id}
                              </div>
                              <div className='col-span-2 flex font-bold text-blueButton-default'>
                                <span>
                                  <IconPersonFill className='mr-3 h-5 w-5' />
                                </span>
                                {complaint?.partner_name}
                              </div>
                              <div className='col-span-2'>
                                <div className='flex font-bold text-blueButton-default'>
                                  <div className='flex'>
                                    <span>
                                      <IconPersonFill className='mr-3 h-5 w-5' />
                                    </span>
                                    {complaint?.customer_name}
                                  </div>
                                </div>
                              </div>
                              <div className='col-span-2'>
                                {complaint?.spare_parts_requested}
                              </div>
                              <div className='col-span-2 w-full max-w-[200px] break-words'>
                                {complaint?.note}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className='flex flex-col gap-4'>
                            <div className='grid grid-cols-3 pr-4'>
                              <div className='flex flex-col gap-5'>
                                <div>
                                  <span className='inline-flex items-center rounded-md bg-dark-default px-2 py-1 text-xs font-medium text-white'>
                                    Complaint ID:- {complaint?.complain_id}
                                  </span>
                                </div>
                              </div>
                              <div className='flex flex-col gap-8'>
                                <address className='pr-8'>
                                  <div>{complaint?.branch_address_1}</div>
                                  <div>{complaint?.branch_address_2}</div>
                                  <div>{complaint?.branch_address_3}</div>
                                  <div>
                                    {complaint?.city_name} -{' '}
                                    {complaint?.branch_zip}
                                  </div>
                                </address>
                                <span className='flex items-center gap-2 font-bold'>
                                  {' '}
                                  <IconTelephoneFill />
                                  Contact-No : {complaint?.contact}
                                </span>
                              </div>
                              <div className='flex flex-col gap-8 '>
                                <div className='flex flex-col gap-2'>
                                  <div className='flex font-bold text-blueButton-default'>
                                    {accountTypeRender(complaint?.partner_type)}
                                    {complaint?.partner_name}
                                  </div>
                                  <div className='flex gap-2'>
                                    <IconMapPin />
                                    {complaint?.city_name}
                                  </div>
                                </div>
                                <div className='flex flex-col gap-2 font-bold capitalize'>
                                  <p>
                                    Complaint Created By:-{' '}
                                    {complaint?.created_by}
                                  </p>
                                  <p>
                                    Complaint Created On:-{' '}
                                    {moment(complaint?.complain_date).format(
                                      DDMMYYYY
                                    )}
                                  </p>
                                  {complaint?.previous_bucket && (
                                    <p>
                                      Previous Bucket:{' '}
                                      {complaint?.previous_bucket}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {complaint?.service_report && (
                              <div className='grid grid-cols-2 border p-3'>
                                <div className='flex gap-4'>
                                  <div className='whitespace-nowrap font-bold'>
                                    Service Report No :{' '}
                                  </div>
                                  <div className='flex flex-wrap gap-5'>
                                    {complaint?.service_report}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className='grid grid-cols-3 border p-3'>
                              <div className='flex gap-4'>
                                <div className='font-bold'>Device Name </div>
                                <div className='capitalize'>
                                  {complaint?.device_name}
                                </div>
                              </div>
                              <div className='flex gap-4'>
                                <div className='font-bold'>
                                  <span className='flex font-bold'>
                                    Complaint Type:
                                  </span>
                                </div>
                                <div>{complaint?.complain_type}</div>
                              </div>
                              <div className='flex gap-4'>
                                <div className='font-bold'>
                                  {' '}
                                  Complaint Status:
                                </div>
                                <div>{complaint?.complain_status}</div>
                              </div>
                            </div>
                            <div className='grid grid-cols-3 border p-3'>
                              <div className='flex gap-4'>
                                <div className='font-bold'>
                                  Nos of Assistant:{' '}
                                </div>
                                <div>{complaint?.no_of_assistants || 0}</div>
                              </div>
                              <div className='flex gap-4'>
                                <div className='font-bold'>Assistant: </div>
                                <div>
                                  <span>
                                    {complaint?.assistant_name || 'NA'}
                                  </span>
                                </div>
                              </div>
                              <div className='flex gap-4'>
                                <div className='font-bold'>AMC Plan: </div>
                                <div>
                                  <span>{complaint?.amc || 'NA'}</span>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
              </>
            )}
          </Accordion>
          {complaintList?.length > displayLimit && (
            <div className='my-5 flex flex-col'>
              <Button onClick={handleLoadMore}>Load More</Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SparePartsReportComplaintsList;
