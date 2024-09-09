import React, { useEffect, useState } from 'react';
import MyDialog from '../MyDialog';
import { ScrollArea } from '../ui/scroll-area';
import ServiceReportEdit from './ServiceReportEdit';
import useServiceReportData from '@/hooks/useServiceReportData';
import useFetchTechnician from '@/hooks/useFetchTechnician';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';

interface CreateServiceReportDialogProps {
  open: boolean;
  onClose: () => void;
  apiBaseUrl: any;
  complaintDetail: any;
}

const CreateServiceReportDialog: React.FC<CreateServiceReportDialogProps> = ({
  open,
  onClose,
  apiBaseUrl,
  complaintDetail,
}) => {
  const { actionCheckList, serviceActionList, sparePartsList } =
    useServiceReportData(apiBaseUrl);
    const apiAction = useMutation(apiCall);
    const [technicianList, setTechnicianList] = useState<any>([]);
  
  // const { technicianList, updateTechnicianList, activeTechnician } =
  //   useFetchTechnician(apiBaseUrl);

    useEffect(() => {
      fetchTechnician();
    }, []);
  
    const fetchTechnician = async () => {
      try {
        let url = `${apiBaseUrl.TECHNICIAN}?need_all=1&is_active=1`;
  
        const getdata = {
          endpoint: `${url}`,
          method: 'GET',
        };
        setTechnicianList(undefined);
        const { data } = await apiAction.mutateAsync(getdata);
        setTechnicianList(data.technician);
      } catch (error) {
        console.error('Failed to fetch technician:', error);
      }
    };

  const handalClose = () => {
    onClose();
  };
  return (
    <MyDialog
      open={open}
      onClose={onClose}
      title='Service Report'
      ClassName='sm:max-w-[90%] h-full grow max-h-[90%]'
    >
      {' '}
      <ScrollArea className='grow bg-gray-100 p-4'>
        <ServiceReportEdit
          isEdit={false}
          technicianList={technicianList}
          actionCheckList={actionCheckList}
          sparePartsList={sparePartsList}
          serviceActionList={serviceActionList}
          apiBaseUrl={apiBaseUrl}
          complaintDetail={complaintDetail}
          onClose={handalClose}
        />
      </ScrollArea>
    </MyDialog>
  );
};

export default CreateServiceReportDialog;
