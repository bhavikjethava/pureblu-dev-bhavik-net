'use client';
import React, { useContext, useEffect, useState } from 'react';
import Filters from '@/components/Filters';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import SearchInput from '@/components/SearchInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { DataContext } from '@/context/dataProvider';
import ComplaintsListItem from '@/components/ComplaintsListItem';
import ROUTES, {
  OptionType,
  REFRESHCOMPLAINTLIST,
  SKILLLIST,
  deleteArrayItem,
  getBaseUrl,
} from '@/utils/utils';
import AssignTechniciansDialog from '@/components/AssignTechniciansDialog';
import QuotationDialog from '@/components/QuotationDialog';
import ComplainStatusChangeDialog from '../ComplainStatusChangeDialog';
import AddNote from '../Note/AddNote';
import ConfirmationDialog from '../ConfirmationDialog';
import { IconBxErrorCircle, IconLoading } from '@/utils/Icons';
import { Button } from '../ui/button';
import ServiceReportDialog from '../Service Report/ServiceReportDialog';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import { usePathname } from 'next/navigation';
import { showToast } from '../Toast';
import { Skeleton } from '../ui/skeleton';

interface FormData {
  [key: string]: any;
}

export type AssignPartner = {
  id: string;
  Name: string;
  Contact: string;
  button: any;
};

function Dashboard({ apiBaseUrl, isDashboard, isPartnerDetail }: any) {
  const { state, setData } = useContext(DataContext);
  const [complaintList, setComplainList] = useState<FormData[]>([]);
  const [filteredComplaintList, setFilteredComplainList] = useState<FormData[]>(
    []
  );
  const [complaintType, setComplaintType] = useState<FormData[]>([]);
  const [assignDialog, setAssignDialog] = useState(false);
  const [filteredTechnicianData, setfilteredTechnicianData] =
    useState<FormData>();
  const [quotationDialog, setQuotationDialog] = useState(false);
  const [selectedComplaint, setselectedComplaint] = useState<FormData>();
  const [errors, setErrors] = useState<FormData>();
  const [loading, setLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchComplaintsTerm, setSearchComplaintsTerm] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState(-1);
  const [complainStatusModal, setComplainStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isConfirmation, setConfirmation] = useState(false);
  const [selectedComplaintIds, setSelectedComplaintIds] = useState<string[]>(
    []
  );
  const [selectAllChecked, setSelectAllChecked] = useState(true);
  const [openServiceReportDialog, setOpenServiceReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>({});
  const [complaintDetail, setComplaintDetail] = useState(
    state?.setComplaintDetail || {}
  );
  const [openAccordion, setOpenAccordion] = useState('undefined');

  const { technicianList, updateTechnicianList } = useFetchTechnician(
    apiBaseUrl,
    selectedComplaint?.customer?.partner_id
  );

  const apiAction = useMutation(apiCall);
  const totalComplaints = filteredComplaintList.reduce(
    (acc, complaint) => acc + (complaint.request?.length || 0),
    0
  );
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isPBAdmin = basePath == ROUTES.PBADMIN;
  const isEnterprise = basePath == ROUTES.ENTERPRISE;
  const isPBEnterprise = basePath == ROUTES.PBENTERPRISE;
  const isPBPartner = basePath == ROUTES.PBPARTNER;
  useEffect(() => {
    !isEnterprise && fetchSkillList();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [state?.[REFRESHCOMPLAINTLIST]]);

  useEffect(() => {
    // Set all checkboxes to checked by default when the component loads
    setComplaintType((prevTypes) =>
      prevTypes.map((type) => ({ ...type, isChecked: true }))
    );

    let filteredData;
    if (searchComplaintsTerm.trim() === '') {
      // If search term is empty, set filtered data to the original complaint list
      filteredData = [...(complaintList || [])];
    } else {
      filteredData = complaintList.map((complaint) => ({
        ...complaint,
        request: complaint.request.filter(
          ({ id, customer, request_technician, device, request_type }: any) => {
            const searchTerm = searchComplaintsTerm.toLowerCase().trim();
            return (
              id.toString() === searchComplaintsTerm.trim() || // Filter based on exact ID match
              customer?.name.toLowerCase().includes(searchTerm) || // Filter by customer name
              customer?.phone?.toLowerCase().includes(searchTerm) || // Filter by customer phone number
              device?.branch?.phone?.toLowerCase().includes(searchTerm) || // Filter by customer phone number
              request_type?.name?.toLowerCase().includes(searchTerm) || // Filter by request_type
              request_technician.technician?.name
                .toLowerCase()
                .includes(searchTerm) || // Filter by technician name
              request_technician.technician?.phone
                ?.toLowerCase()
                .includes(searchTerm) // Filter by technician number
            );
          }
        ),
      }));
    }
    // Set the filtered data to state
    setFilteredComplainList(filteredData);
  }, [searchComplaintsTerm, complaintList]);

  useEffect(() => {
    // Filter data based on the search term
    const filteredTechnicianData = technicianList?.filter((item: any) => {
      const searchMatch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let excludeItemById = true;
      if (selectedComplaint?.isAssistant) {
        excludeItemById =
          item.id !== selectedComplaint?.request_technician?.technician?.id;
      }
      if (selectedSkill == -1) {
        return searchMatch && excludeItemById;
      } else {
        const skillMatch = item.skills.some(
          (skill: any) => skill.skill_id === selectedSkill
        );
        return searchMatch && skillMatch && excludeItemById;
      }
    });

    setfilteredTechnicianData(filteredTechnicianData);
  }, [searchTerm, technicianList, selectedSkill, assignDialog]);

  const fetchSkillList = async () => {
    try {
      const fetchSkillRequest = {
        endpoint: `${apiBaseUrl.SKILL}?need_all=1`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(fetchSkillRequest);
      setData({ [SKILLLIST]: data });
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const fetchComplaints = async () => {
    setComplaintLoading(true); // Set loading to false after data is fetched
    try {
      const fetchComplaints = {
        endpoint: `${apiBaseUrl.DASHBOARDREQUEST}`,
        method: 'GET',
      };
      const { data } = await apiAction.mutateAsync(fetchComplaints);
      if (data) {
        setComplainList(data);
        setComplaintType(data);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setComplaintLoading(false); // Set loading to false after data is fetched
    }
  };

  const fetchReportDetail = async (report: any, complaint: any) => {
    try {
      // setFetchLoading(true);
      const data = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${complaint.customer_id}/request/${report?.request_id}/service-report/${report?.id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      // setReportList(response?.data);
      if (response) {
        setSelectedReport(response?.data);
        setOpenServiceReportDialog(true);
      }
      // setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      // setFetchLoading(false);
    }
  };

  const openAssignDialog = (complaint: any, assistant: string) => {
    if (assistant) {
      complaint.isAssistant = true;
      const tempList = deleteArrayItem(
        filteredTechnicianData as any,
        complaint?.request_technician?.technician
      );
      setfilteredTechnicianData(tempList);
    } else {
      complaint.isAssistant = false;
    }
    setSelectedComplaintIds([complaint.id]);
    setselectedComplaint(complaint);
    setErrors({});
    setAssignDialog(true);
  };

  const openMultipalAssignDialog = () => {
    setAssignDialog(true);
  };

  const openQuotationDialog = (complaint: any) => {
    setselectedComplaint(complaint);
    setErrors({});
    setQuotationDialog(true);
  };

  const onCloseNoteModal = () => {
    setShowNoteModal(false);
    setselectedComplaint({});
  };

  const openNoteDialog = (complaint: any) => {
    setselectedComplaint(complaint);
    setShowNoteModal(true);
  };

  const openComplaintsDeleteDialog = (complaint: any) => {
    setselectedComplaint(complaint);
    setConfirmation(true);
  };

  const handleDeleteConfirmationClick = async () => {
    setLoading(true);
    try {
      const deleteComplaint = {
        endpoint: `${apiBaseUrl.CUSTOMERS}/${selectedComplaint?.customer_id}/request/${selectedComplaint?.id}?device_id=${selectedComplaint?.device_id}`,
        method: 'DELETE',
      };

      const { data, isError } = await apiAction.mutateAsync(deleteComplaint);
      if (!isError) {
        setConfirmation(false);
        setData({ [REFRESHCOMPLAINTLIST]: !state?.[REFRESHCOMPLAINTLIST] });
        setselectedComplaint({});
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const handleFilterClick = (startDate: Date, endDate: Date) => {
    if (startDate && endDate) {
      const filteredData = complaintList
        .map((complaint) => {
          const filteredRequests = complaint.request.filter(
            (requestItem: any) => {
              // Parse request created_at date string into a Date object
              const requestDate = new Date(requestItem.created_at);
              // Perform date comparison
              return requestDate >= startDate && requestDate <= endDate;
            }
          );

          return {
            ...complaint,
            request: filteredRequests,
          };
        })
        .filter((complaint) => complaint.request.length > 0);

      // Set the filtered data to state
      setFilteredComplainList(filteredData);
    }
  };

  // Handler for "Select All" checkbox
  const handleSelectAllChange = () => {
    const checked = !selectAllChecked;
    setSelectAllChecked(checked);

    // Update isChecked property of all complaint types
    setComplaintType((prevTypes) =>
      prevTypes.map((type) => ({ ...type, isChecked: checked }))
    );

    // If "Select All" is checked, select all complaints
    if (checked) {
      setSelectedComplaintIds(complaintList.map((complaint) => complaint.id));
    } else {
      setSelectedComplaintIds([]); // Otherwise, clear selected complaints
    }

    // Update filtered complaint list based on the checked status
    const filteredData = checked ? [...complaintList] : [];
    setFilteredComplainList(filteredData);
  };

  const onChecked = (index: number) => {
    const updatedComplaintType = [...complaintType];
    updatedComplaintType[index].isChecked =
      !updatedComplaintType[index].isChecked; // Toggle the checked status

    setComplaintType(updatedComplaintType);

    // Update filtered list
    const filteredData = complaintList.filter((complaint) => {
      // Check if complaint name exists in updatedComplaintType and if it's checked
      return updatedComplaintType.some(
        (type) => type.name === complaint.name && type.isChecked
      );
    });

    setFilteredComplainList(filteredData);
  };

  const onSearch = (text: string) => {
    setSearchComplaintsTerm(text);
  };

  const handleCheckboxChange = (complaintId: any) => {
    // Check if the complaintId is already selected
    if (selectedComplaintIds.includes(complaintId)) {
      // If it's selected, remove it from the array
      setSelectedComplaintIds(
        selectedComplaintIds.filter((id) => id !== complaintId)
      );
    } else {
      // If it's not selected, add it to the array
      setSelectedComplaintIds([...selectedComplaintIds, complaintId]);
    }
  };

  const getReportDetail = async (report: any, complaint: any) => {
    setComplaintDetail(complaint);
    fetchReportDetail(report, complaint);
  };

  const updateComplaintListByCity = (cities: any[]) => {
    // Check if "Select All" is checked
    const isSelectAllChecked = cities.length > 0 && cities[0].isChecked;

    if (isSelectAllChecked) {
      // If "Select All" is checked, select all complaints
      setFilteredComplainList(complaintList);
    } else {
      // Extract names of selected cities
      const selectedCityNames = cities
        .filter((city) => city.isChecked && city.id !== 'all') // Exclude "Select All"
        .map((city) => city.id);

      // Filter complaintList based on selected cities
      const filteredComplaints = complaintList.filter((complaint) =>
        complaint.request.some((requestItem: any) =>
          selectedCityNames.includes(requestItem?.device?.branch?.city_id)
        )
      );

      if (filteredComplaints.length === 0) {
        showToast({
          variant: 'destructive',
          message: 'No records found.',
          icon: <IconBxErrorCircle className='h-6 w-6' />,
        });
      }

      setFilteredComplainList(filteredComplaints); // Set filtered complaints list
    }
  };

   const refreshCompain = () => {
    setData({ [REFRESHCOMPLAINTLIST]: new Date().toISOString() });
    // setselectedComplaint({});
  }

  return (
    <div className='flex h-full grow flex-col overflow-hidden md:flex-row'>
      {!isPartnerDetail && (
        <Filters
          handleFilterClick={handleFilterClick}
          updateComplaintListByCity={updateComplaintListByCity}
          onChecked={onChecked}
          errors={errors}
          complaintList={filteredComplaintList}
          complaintType={complaintType}
          selectAllChecked={selectAllChecked}
          onSelectAllChange={handleSelectAllChange}
        />
      )}
      <div className='flex h-full flex-grow flex-col p-6 md:p-5'>
        <SearchInput
          value={searchComplaintsTerm}
          onChange={onSearch}
          className='py-4'
          placeholder='Search by ID, customer name, phone, request type, or technician details'
        />

        <div className='flex h-full flex-col gap-5 overflow-auto'>
          <div className='flex w-full items-center justify-between gap-5 pr-5 pt-2'>
            <div className='ml-auto'>Total Complaints: {totalComplaints}</div>
            {isPBPartner && !isPartnerDetail && (
              <Button
                variant={'outline'}
                size={'sm'}
                disabled={!selectedComplaintIds.length}
                onClick={() => openMultipalAssignDialog()}
              >
                Assign Technician
              </Button>
            )}
          </div>
          <ScrollArea>
            <div className='grow  overflow-auto pr-5'>
              <Accordion
                type='single'
                collapsible
                className='flex flex-col gap-5'
                value={openAccordion}
                onValueChange={(value) => setOpenAccordion(value)}
              >
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
                    {filteredComplaintList &&
                      filteredComplaintList?.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`main-item-${index}`}
                          className='rounded-md border-none bg-white px-4 no-underline'
                        >
                          <AccordionTrigger className='text-left hover:no-underline'>
                            <div className='flex w-full items-center justify-between pr-5'>
                              <div className='text-base font-bold'>
                                {item?.name}
                              </div>
                              <div>Complaints: {item?.request?.length}</div>
                            </div>
                          </AccordionTrigger>
                          {item?.request?.length > 0 && (
                            <AccordionContent>
                              <Accordion type='single' collapsible>
                                {item?.request?.map((req_item: any, i: any) => (
                                  <AccordionItem
                                    key={i}
                                    value={`item-${i}`}
                                    className='mb-5 border px-4 no-underline'
                                  >
                                    <ComplaintsListItem
                                      complaint={req_item}
                                      apiBaseUrl={apiBaseUrl}
                                      openAssignDialog={openAssignDialog}
                                      onCheckboxChange={handleCheckboxChange}
                                      openQuotationDialog={openQuotationDialog}
                                      openNoteDialog={openNoteDialog}
                                      openComplaintsDeleteDialog={
                                        openComplaintsDeleteDialog
                                      }
                                      getReportDetail={getReportDetail}
                                      openComplaintStatusDialog={(item) => {
                                        setComplainStatusModal(true);
                                        setselectedComplaint(item);
                                      }}
                                      selectedComplaintIds={
                                        selectedComplaintIds
                                      }
                                      isDashboard={isDashboard}
                                      currentBucket={item?.name}
                                      refreshCompain={refreshCompain}
                                    />
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </AccordionContent>
                          )}
                        </AccordionItem>
                      ))}
                  </>
                )}
              </Accordion>
            </div>
          </ScrollArea>
        </div>
      </div>

      {assignDialog && (
        <AssignTechniciansDialog
          open={assignDialog}
          onClose={() => {
            setAssignDialog(false), setselectedComplaint({});
            setSelectedSkill(-1);
            setSelectedComplaintIds([]);
          }}
          afterSave={() => {
            setOpenAccordion('');
          }}
          technicianList={filteredTechnicianData}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
          selectedComplaintIds={selectedComplaintIds}
        />
      )}

      {quotationDialog && (
        <QuotationDialog
          open={quotationDialog}
          onClose={() => {
            setQuotationDialog(false), setselectedComplaint({});
          }}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
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
          reportListList={[selectedReport]}
        />
      )}

      {complainStatusModal && (
        <ComplainStatusChangeDialog
          open={complainStatusModal}
          onClose={() => {
            setComplainStatusModal(false), setselectedComplaint({});
          }}
          apiBaseUrl={apiBaseUrl}
          selectedComplaint={selectedComplaint}
        />
      )}

      {showNoteModal && (
        <AddNote
          apiBaseUrl={apiBaseUrl}
          isShow={showNoteModal}
          onClose={onCloseNoteModal}
          complaint={selectedComplaint}
        />
      )}

      <ConfirmationDialog
        isOpen={isConfirmation}
        onClose={() => {
          setConfirmation(false);
          setselectedComplaint({});
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
    </div>
  );
}

export default Dashboard;
