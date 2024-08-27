import React, { useContext, useEffect } from 'react';
import MyDialog from '../MyDialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import moment from 'moment';
import ServiceReportEdit from './ServiceReportEdit';
import useServiceReportData from '@/hooks/useServiceReportData';
import useFetchTechnician from '@/hooks/useFetchTechnician';

interface ServiceReportDialogProps {
  open: boolean;
  onClose: () => void;
  apiBaseUrl: any;
  complaintDetail: any;
  reportListList: any;
}

const ServiceReportDialog: React.FC<ServiceReportDialogProps> = ({
  open,
  onClose,
  apiBaseUrl,
  complaintDetail,
  reportListList,
}) => {
  const { actionCheckList, serviceActionList, sparePartsList } =
    useServiceReportData(apiBaseUrl);

  const { technicianList, updateTechnicianList, activeTechnician } =
    useFetchTechnician(apiBaseUrl, undefined, true);
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Service Report'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
    >
      {' '}
      <ScrollArea className='grow bg-gray-100 p-4'>
        <Accordion type='single' collapsible className='flex flex-col gap-5'>
          {reportListList &&
            reportListList?.map((report: any, deviceIndex: number) => {
              const fullAddress = [
                report?.customer_request?.branch?.address_1,
                report?.customer_request?.branch?.address_2,
                report?.customer_request?.branch?.address_3,
                report?.customer_request?.branch?.state?.name,
                report?.customer_request?.branch?.city?.name,
                report?.customer_request?.branch?.zip,
              ]
                .filter(Boolean)
                .join(', ')
                .trim();

              return (
                <AccordionItem
                  key={deviceIndex}
                  value={`main-item-${deviceIndex}`}
                  className='rounded-md border-none bg-white px-4 no-underline'
                >
                  <AccordionTrigger className='text-left hover:no-underline'>
                    <div className=' w-full '>
                      <div className='flex w-full flex-col gap-3 capitalize'>
                        <div className='flex gap-6 text-sm font-bold'>
                          <span>
                            Report Date:-{' '}
                            {moment(report?.created_at).format('DD MMMM, YYYY')}{' '}
                          </span>
                          <span>Report No. :- {report.id} </span>
                          <span>Technician :- {report?.technician?.name}</span>
                        </div>
                        <div className='text-sm font-bold'>
                          Address :- {fullAddress || 'No address available'}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='flex flex-col gap-4'>
                    <ServiceReportEdit
                      isEdit={true}
                      technicianList={technicianList}
                      actionCheckList={actionCheckList}
                      sparePartsList={sparePartsList}
                      serviceActionList={serviceActionList}
                      apiBaseUrl={apiBaseUrl}
                      complaintDetail={complaintDetail}
                      reportData={report}
                      onClose={onClose}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
            {(reportListList?.length || 0) == 0 && <span>No Service Report Found!</span>}
        </Accordion>
      </ScrollArea>
    </MyDialog>
  );
};

export default ServiceReportDialog;
