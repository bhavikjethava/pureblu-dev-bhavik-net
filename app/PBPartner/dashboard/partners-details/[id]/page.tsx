'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataContext } from '@/context/dataProvider';
import { apiCall } from '@/hooks/api';
import { API_ENDPOINTS, API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { IconCirclePause, IconLoading, IconPlayCircle } from '@/utils/Icons';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Loader from '@/components/Loader';
import ListGroup from '@/components/ListGroup';
import ListGroupItem from '@/components/ListGroupItem';
import AddressField from '@/components/AddressEditableField';
import TabsComponent from '@/components/TabsComponent';
import Dashboard from '@/components/Customers/Dashboard';
import PartnersTechnicianList from '@/components/Technician/PartnersTechnicianList';
import PartnerDetailCustomerList from '@/components/Customers/PartnerDetailCustomerList';
import { usePathname } from 'next/navigation';
import ROUTES, { getAuthKeyFromBasePath, getBaseUrl } from '@/utils/utils';

const PartnersDetails = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const { state } = useContext(DataContext);
  const [partner, setPartner] = useState(state?.partner || {});
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>();

  const apiAction = useMutation(apiCall);
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const type = getAuthKeyFromBasePath(basePath);
  const isPBPartner = basePath == ROUTES.PBPARTNER;

  useEffect(() => {
    if (isPBPartner) {
      const storedUserData = localStorage.getItem(`${type}_user_info`);
      if (storedUserData) {
        const formatedUser = JSON.parse(storedUserData);
        setSelectedPartner(formatedUser);
      }
    }
  }, []);

  const tabData = [
    {
      title: 'Complaint',
      content: (
        <Dashboard apiBaseUrl={API_ENDPOINTS_PARTNER} isPartnerDetail={true} />
      ),
    },
    {
      title: 'Technicians',
      content: <PartnersTechnicianList apiBaseUrl={API_ENDPOINTS_PARTNER} />,
    },
    {
      title: 'Customers',
      content: <PartnerDetailCustomerList apiBaseUrl={API_ENDPOINTS_PARTNER} />,
    },
  ];

  return (
    <div className='flex h-full grow flex-col overflow-hidden md:flex-row'>
      <div className='w-full flex-none rounded-sm bg-white px-5 py-10 text-base shadow-2xl md:w-[300px]'>
        <div>
          <dl className='max-w-md divide-y divide-gray-200 text-sm'>
            <ListGroup>
              <ListGroupItem
                label='Name of Contact'
                value={selectedPartner?.partner?.name}
                loading={!selectedPartner?.partner_id} // Add loading prop here
              />
              <ListGroupItem
                label='Contact Number'
                value={selectedPartner?.phone}
                loading={!selectedPartner?.partner_id} // Add loading prop here
              />
              <ListGroupItem>
                <AddressField
                  label='Address'
                  selectedformData={selectedPartner}
                  loading={!selectedPartner?.partner_id} // Add loading prop here
                />
              </ListGroupItem>

              <ListGroupItem>
                {partner?.id ? (
                  <Button
                    className=''
                    variant={'outline'}
                    size={'sm'}
                    onClick={() =>
                      partner?.is_pause
                        ? setConfirmationDialogOpen(true)
                        : setShowModal(true)
                    }
                  >
                    {!partner?.is_pause ? (
                      <IconCirclePause className='mr-2 h-[18px] w-[18px]' />
                    ) : (
                      <IconPlayCircle className='mr-2 h-[20px] w-[20px]' />
                    )}
                    {!partner?.is_pause ? 'Pause' : 'UnPause'} Partner
                  </Button>
                ) : null}
              </ListGroupItem>
            </ListGroup>
          </dl>
        </div>
      </div>
      <div className='flex h-full flex-grow flex-col'>
        <TabsComponent tabData={tabData} />
      </div>
    </div>
  );
};

export default PartnersDetails;
