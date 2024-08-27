'use client';
import Filters from '@/components/Filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataContext } from '@/context/dataProvider';
import { apiCall } from '@/hooks/api';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import PauseDialog from '../PauseDialog';
import { IconCirclePause, IconLoading, IconPlayCircle } from '@/utils/Icons';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { getActiveDeactiveMsg } from '@/utils/utils';
import Loader from '@/components/Loader';
import ListGroup from '@/components/ListGroup';
import ListGroupItem from '@/components/ListGroupItem';
import AddressField from '@/components/AddressEditableField';

const PartnersDetails = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const { state } = useContext(DataContext);
  const [partner, setPartner] = useState(state?.partner || {});
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const apiAction = useMutation(apiCall);
  useEffect(() => {
    // if (!state.partner) {
    fetchPartnerDetail();
    // }
  }, []);

  const fetchPartnerDetail = async () => {
    try {
      setFetchLoading(true);
      const data = {
        endpoint: `${API_ENDPOINTS.PARTNER}/${id}`,
        method: 'GET',
      };

      const response = await apiAction.mutateAsync(data);
      setPartner(response?.data || {});
      setFetchLoading(false);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      setFetchLoading(false);
    }
  };

  const onPause = async (params: any) => {
    setLoading(true);
    const partner = {
      endpoint: `${API_ENDPOINTS.PARTNER}/${id}/pause-unpause`,
      method: 'POST',
      body: params,
    };
    const pausePartner = await apiAction.mutateAsync(partner);
    setLoading(false);
    if (!pausePartner.isError) {
      fetchPartnerDetail();
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

  return (
    <div className='flex h-full grow flex-col overflow-hidden md:flex-row'>
      <div className='w-full flex-none rounded-sm bg-white px-5 py-10 text-base shadow-2xl md:w-[300px]'>
        <div>
          <dl className='max-w-md divide-y divide-gray-200 text-sm'>
            <ListGroup>
              <ListGroupItem
                label='Name of Contact'
                value={partner.name}
                loading={!partner.id} // Add loading prop here
              />
              <ListGroupItem
                label='Contact Number'
                value={partner?.user?.phone}
                loading={!partner.id} // Add loading prop here
              />
              <ListGroupItem>
                <AddressField
                  label='Address'
                  selectedformData={partner.user}
                  loading={!partner.id} // Add loading prop here
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
      <div className='h-full flex-grow p-6 text-base md:p-5'>
        <div className='flex h-full flex-col gap-5'>
          <ScrollArea>
            <div className='grow  overflow-auto pr-5'>
              <Card className='overflow-hidden'>
                <CardContent className='p-4'>
                  <Card className='overflow-hidden'>
                    <CardContent className='p-4'>
                      <div className='flex flex-col gap-5'>
                        <div className='grid grid-cols-2'>
                          <div className='capitalize'>Name Of Contact</div>
                          <div className='capitalize'>
                            {partner?.name || ''}
                          </div>
                        </div>
                        <div className='grid grid-cols-2'>
                          <div className='capitalize'>Contact Number</div>
                          <div className='capitalize'>
                            {partner?.user?.phone}
                          </div>
                        </div>
                        <div className='grid grid-cols-2'>
                          <div className='capitalize'>Address</div>
                          <div className='flex flex-col gap-2 capitalize'>
                            {partner?.user?.address_1 ? (
                              <p className='font-medium'>
                                {partner?.user?.address_1},
                              </p>
                            ) : null}
                            {partner?.user?.address_2 ? (
                              <p className='font-medium'>
                                {partner?.user?.address_2},
                              </p>
                            ) : null}
                            {partner?.user?.state?.name ? (
                              <p className='font-medium'>
                                {partner?.user?.state?.name},
                              </p>
                            ) : null}
                            {partner?.user?.city?.name || partner?.user?.zip ? (
                              <p className='font-medium'>
                                {partner?.user?.city?.name
                                  ? partner?.user?.city?.name
                                  : ''}
                                {partner?.user?.zip
                                  ? ` - ${partner?.user?.zip}`
                                  : null}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              {showModal && (
                <PauseDialog
                  open={showModal}
                  onPause={onPause}
                  isLoading={isLoading}
                  id={id}
                  onClose={() => {
                    setShowModal(false);
                  }} // Set onClose to a function that sets selectedRow to null
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
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
      {fetchLoading ? <Loader /> : null}
    </div>
  );
};

export default PartnersDetails;
