'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Button } from '@/components/ui/button';
import {
  IconBxTransferAlt,
  IconCirclePause,
  IconLoading,
  IconMapPin,
  IconPersonFill,
  IconPlayCircle,
  IconTelephoneFill,
} from '@/utils/Icons';
import { useContext, useEffect, useState } from 'react';
import TableComponent from '@/components/Table';
import Radio from '@/components/Radio';
import MyDialog from '@/components/MyDialog';
import SearchInput from '@/components/SearchInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { API_BASE_URL, API_ENDPOINTS } from '@/utils/apiConfig';
import { useApiResource } from '@/hooks/useApiResource';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import ProfileImage from '@/components/ProfileImage';
import TransferDialog from '@/app/PBAdmin/dashboard/technician/TransferDialog';
import PauseDialog from '@/app/PBAdmin/dashboard/technician/PauseDialog';
import { DataContext } from '@/context/dataProvider';
import ListGroup from '../ListGroup';
import ListGroupItem from '../ListGroupItem';
import ComplaintsList from '../Customers/ComplaintsList';

export type AssignPartner = {
  id: string;
  Name: string;
  Contact: string;
  button: any;
};

interface AssignPartnerColumn {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const TechnicianDetail = ({ id, apiBaseUrl }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );
  const { state } = useContext(DataContext);
  const [technician, setTechnician] = useState(state?.technician || {});
  const apiAction = useMutation(apiCall);

  useEffect(() => {
      fetchTechnicianDetail();
  }, []);

  const fetchTechnicianDetail = async () => {
    try {
      const data = {
        endpoint: `${apiBaseUrl.TECHNICIAN}/${id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setTechnician(response?.data || {});
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const {
    resourceData: partnerData,
    isLoadingResource: partnerLoading,
    isErrorResource: partnerError,
  } = useApiResource(`${API_BASE_URL}${apiBaseUrl.PARTNERS}`, 'assignpartner');

  const {
    resourceData: partnerComplains,
    isLoadingResource: partnerComplainsLoading,
    isErrorResource: partnerComplainsError,
  } = useApiResource(
    `${API_BASE_URL}${apiBaseUrl.PARTNER_COMPLAINS}`,
    'partnerComplains'
  );

  if (partnerLoading || partnerComplainsLoading) {
    return <Loader />;
  }

  if (partnerError || partnerComplainsError) {
    return <div>Error fetching data</div>;
  }

  const handleRadioChange = (radioId: string, isChecked: boolean) => {
    setSelectedRadio(isChecked ? radioId : null);
  };

  const columns: AssignPartnerColumn[] = [
    {
      accessorKey: 'button',
      header: '',
      className: 'max-w-[120px]',
      render: (item: AssignPartner, index: number) => (
        <Radio
          checked={selectedRadio === item.id}
          onCheckedChange={(value: boolean) =>
            handleRadioChange(item.id, value)
          }
          ariaLabel=''
          name={`assignPartnerRadioGroup-${index}`} // Unique name for each radio group
        />
      ),
    },
    { accessorKey: 'partner_name', header: 'Name', className: '' },
    { accessorKey: 'contact', header: 'Contact' },
  ];

  const onPause = async (params: any) => {
    setLoading(true);
    const partner = {
      endpoint: `${apiBaseUrl.TECHNICIAN}/${id}/pause-unpause`,
      method: 'POST',
      body: params,
    };
    const pausePartner = await apiAction.mutateAsync(partner);
    setLoading(false);
    if (!pausePartner.isError) {
      fetchTechnicianDetail();
      setShowModal(false);
      setConfirmationDialogOpen(false);
    }
  };

  const onUnPause = () => {
    let params = {
      action: 'unpause',
    };
    onPause(params);
  };

  const onTransfer = async (params: any) => {
    setLoading(true);
    try {
      const data = {
        endpoint: `${apiBaseUrl.TECHNICIAN}/${id}/transfer`,
        method: 'POST',
        body: params,
      };

      const response = await apiAction.mutateAsync(data);
      if (!response.isError) {
        fetchTechnicianDetail();
        setShowTransferModal(false);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex h-full grow flex-col overflow-hidden md:flex-row'>
      <div className='flex w-full flex-col rounded-sm bg-white px-5 py-10 text-base shadow-2xl md:w-[300px] min-w-[300px]'>
        <div className='h-full grow '>
          <div className='flex h-full flex-col'>
            <div className='mb-6'>
              <ProfileImage
                src={technician?.profile_image}
                height={108}
                width={108}
                alt={technician?.name || 'Profile Image'}
              />
            </div>
            <ScrollArea className='h-full grow'>
              <ListGroup>
                <ListGroupItem
                  label='Technician ID'
                  value={`PBTECH-${technician?.id}`}
                  loading={!technician?.id} // Add loading prop here
                />
                <ListGroupItem
                  label='Name of Technician'
                  value={technician?.name}
                  loading={!technician.id} // Add loading prop here
                />
                <ListGroupItem
                  label='Contact Number'
                  value={technician?.phone}
                  loading={!technician?.id} // Add loading prop here
                />
                <ListGroupItem
                  label='Partner Name'
                  value={technician?.partner?.name}
                  loading={!technician.id} // Add loading prop here
                />

                <ListGroupItem>
                  {technician?.id && technician.status !== 3 ? (
                    <Button
                      className='mt-6'
                      variant={'outline'}
                      size={'sm'}
                      onClick={() =>
                        technician?.is_pause
                          ? setConfirmationDialogOpen(true)
                          : setShowModal(true)
                      }
                    >
                      {!technician?.is_pause ? (
                        <IconCirclePause className='mr-2 h-[18px] w-[18px]' />
                      ) : (
                        <IconPlayCircle className='mr-2 h-[20px] w-[20px]' />
                      )}
                      {!technician?.is_pause ? 'Pause' : 'UnPause'} Technician
                    </Button>
                  ) : null}
                  {technician?.id &&
                  technician.status !== 3 &&
                  apiBaseUrl == API_ENDPOINTS ? (
                    <Button
                      className='mt-6'
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => setShowTransferModal(true)}
                    >
                      {!technician?.is_pause ? (
                        <IconBxTransferAlt className='mr-2 h-[18px] w-[18px]' />
                      ) : (
                        <IconBxTransferAlt className='mr-2 h-[20px] w-[20px]' />
                      )}
                      Transfer Technician
                    </Button>
                  ) : null}
                </ListGroupItem>
              </ListGroup>
            </ScrollArea>
          </div>
        </div>
      </div>
      <div className='h-full flex-grow p-6 md:p-5'>
        <div className='flex h-full flex-col gap-5'>
          
          <ComplaintsList isTechnician={true} apiBaseUrl={apiBaseUrl} />

          {showModal && (
            <PauseDialog
              open={showModal}
              onPause={onPause}
              isLoading={isLoading}
              id={id}
              apiBaseUrl={apiBaseUrl}
              onClose={() => {
                setShowModal(false);
              }} // Set onClose to a function that sets selectedRow to null
            />
          )}
        </div>
        {showTransferModal && (
          <TransferDialog
            open={showTransferModal}
            onTransfer={onTransfer}
            isLoading={isLoading}
            id={id}
            apiBaseUrl={apiBaseUrl}
            onClose={() => {
              setShowTransferModal(false);
            }} // Set onClose to a function that sets selectedRow to null
          />
        )}
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => {
            setConfirmationDialogOpen(false);
          }}
          buttons={[
            {
              text: 'Yes',
              variant: 'destructive',
              size: 'sm',
              onClick: onUnPause,
              btnLoading: isLoading,
              icon: isLoading ? <IconLoading /> : '',
            },
          ]}
          ClassName='sm:max-w-lg' // You can customize the dialog size class if needed
        >
          Do You Really Want to Unpause This Record
        </ConfirmationDialog>
      </div>
    </div>
  );
};

export default TechnicianDetail;
