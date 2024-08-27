'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  InfoWindow,
} from '@react-google-maps/api';
import TableComponent from '@/components/Table';
import { API_ENDPOINTS_PARTNER } from '@/utils/apiConfig';
import { useMutation } from 'react-query';
import { apiCall } from '@/hooks/api';
import { OptionType } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import CheckboxItem from '@/components/CheckboxItem';

interface ColumneProps {
  accessorKey: string;
  header: string;
  className?: string;
  [key: string]: any; // Allow any additional properties
}

const MapView = () => {
  const libraries = useMemo(() => ['places'], []);
  const apiAction = useMutation(apiCall);
  const [checkinList, setCheckinList] = useState<Array<OptionType>>([]);
  const [technicianList, setTechnicianList] = useState<Array<OptionType>>([]);

  const [selectedMarker, setSelectedMarker] = useState<{
    lat: number;
    lng: number;
    name: string;
    CustomerName?: string;
    request_id?: string;
  } | null>(null);
  const [markers, setMarkers] = useState<
    { lat: number; lng: number; name: string }[]
  >([]);
  const [hoveredMarker, setHoveredMarker] = useState(null);

  const [initialCenter, setInitialCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 19.07609,
    lng: 72.877426,
  });
  const [mapType, setMapType] = useState();

  const mapRef = useRef<any>(null);
  const [openTerrain, setOpenTerrain] = useState(false);
  const [openSatelliteLabel, setOpenSatelliteLabel] = useState(false);

  const handleMouseEnter = (isSatellite?: boolean) => {
    if (isSatellite) {
      setOpenSatelliteLabel(true);
    } else {
      setOpenTerrain(true);
    }
  };

  const handleMouseLeave = () => {
    setOpenTerrain(false);
    setOpenSatelliteLabel(false);
  };

  useEffect(() => {
    fetchTechnicianList();
  }, []);

  const changeMapType = (type: any) => {
    setMapType(type);
  };

  const handleMouseOver = (marker: any) => {
    setHoveredMarker(marker);
  };

  const handleMouseOut = () => {
    setHoveredMarker(null);
  };

  const loadMarkers = () => {
    if (mapRef.current && checkinList.length > 0) {
      const markersList: { lat: number; lng: number; name: string }[] =
        checkinList.map((item: any) => ({
          lat: parseFloat(item.latitude),
          lng: parseFloat(item.longitude),
          name: item.technician_name,
          request_id: item?.request_id || '',
          CustomerName: item?.CustomerName || '',
        }));

      setMarkers([...markersList]);

      const bounds = new window.google.maps.LatLngBounds();
      markersList.forEach((marker) => {
        bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
      });
      mapRef.current.fitBounds(bounds);
    }
  };

  // useEffect(() => {
  //   loadMarkers();
  // }, [loadMarkers]);

  useEffect(() => {
    loadMarkers();
  }, [checkinList]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInitialCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchTechnicianList = async () => {
    try {
      const checkin = {
        endpoint: `${API_ENDPOINTS_PARTNER.CHECKEDIN_TECHNICIAN_LIST}`,
        method: 'GET',
      };

      const { data } = await apiAction.mutateAsync(checkin);
      setTechnicianList([...data.technician_list]);
      setCheckinList([...data.complain]);
      // After setting checkinList, load markers
      // loadMarkers();
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    }
  };

  const mapOptions = useMemo<any>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      scrollwheel: true,
      zoomControl: true,
      fullscreenControl: true,
      streetViewControl: true,
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    libraries: libraries as any,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    loadMarkers();
  }, []);

  const onTechnicianClick = (technician: any) => {
    const relatedComplains = checkinList.filter(
      (complain: any) => complain.technician_id === technician.technician_id
    );

    const markersData = relatedComplains.map((complain: any) => ({
      lat: parseFloat(complain.latitude),
      lng: parseFloat(complain.longitude),
      name: complain.technician_name,
      request_id: complain?.request_id || '',
      CustomerName: complain?.CustomerName || '',
    }));

    setMarkers(markersData);

    const bounds = new google.maps.LatLngBounds();
    markersData.forEach((marker) => {
      bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
    });
    mapRef.current.fitBounds(bounds);
    // mapRef.current!.setZoom(10);
  };

  const columns: ColumneProps[] = [
    {
      accessorKey: 'name',
      header: 'Assigned Technician',
      render: (item: any) => (
        <label
          className='mb-2 w-full cursor-pointer text-center font-bold hover:text-blue-700'
          onClick={() => onTechnicianClick(item)}
        >
          {item?.technician_name}
        </label>
      ),
    },
  ];

  const onMarkerClick = (marker: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setSelectedMarker(marker);
  };

  const onInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  return (
    <div className='h-full overflow-hidden p-5'>
      <div className='flex h-full flex-col gap-5 bg-white p-5'>
        {/* <Breadcrumb /> */}
        <div className='grid h-full w-full grid-cols-4'>
          <div className='relative col-span-3'>
            {isLoaded ? (
              <>
                <GoogleMap
                  options={mapOptions}
                  zoom={14}
                  center={initialCenter}
                  mapTypeId={mapType}
                  // mapTypeId={google.maps.MapTypeId.ROADMAP}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  onLoad={onLoad}
                >
                  {markers.map((marker: any, index) => (
                    <MarkerF
                      key={index}
                      position={marker}
                      onClick={() => onMarkerClick(marker)}
                      onMouseOver={() => handleMouseOver(marker)}
                      onMouseOut={handleMouseOut}
                    >
                      {hoveredMarker === marker && (
                        <InfoWindow
                          position={{
                            lat: marker?.lat,
                            lng: marker?.lng,
                          }}
                          // onCloseClick={onInfoWindowClose}
                        >
                          <div className='rounded-lg text-white shadow-md'>
                            <div className='flex p-1'>
                              <p className='font-semibold'>Technician Name:</p>
                              <p className='pl-1'>{marker?.name}</p>
                            </div>
                            <div className='flex p-1'>
                              <p className='font-semibold'>Complaint Id:</p>
                              <p className='pl-1'>{marker?.request_id}</p>
                            </div>
                            <div className='flex p-1'>
                              <p className='font-semibold'>Customer Name:</p>
                              <p className='pl-1'>{marker?.CustomerName}</p>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </MarkerF>
                  ))}
                </GoogleMap>
                <div className='absolute left-5 top-5 flex items-center overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm'>
                  <Popover open={openTerrain}>
                    <PopoverTrigger
                      asChild
                      className='focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0'
                      onMouseEnter={() => handleMouseEnter()}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Button
                        variant={'ghost'}
                        className={` rounded-none hover:bg-primary hover:text-white ${
                          mapType ===
                            window?.google?.maps?.MapTypeId?.ROADMAP ||
                          mapType == undefined ||
                          mapType === window?.google?.maps?.MapTypeId?.TERRAIN
                            ? 'bg-primary text-white'
                            : ''
                        }`}
                        onClick={() =>
                          changeMapType(
                            window?.google?.maps?.MapTypeId?.ROADMAP
                          )
                        }
                      >
                        Map
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      style={{ marginTop: -3 }}
                      className='ml-10 w-auto p-4 '
                      onMouseEnter={() => handleMouseEnter()}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div>
                        <CheckboxItem
                          ariaLabel='Terrain'
                          id={`Terrain`}
                          tabIndex={-1}
                          checked={
                            mapType === window?.google?.maps?.MapTypeId?.TERRAIN
                          }
                          onCheckedChange={() => {
                            changeMapType(
                              mapType ===
                                window?.google?.maps?.MapTypeId?.TERRAIN
                                ? window?.google?.maps?.MapTypeId?.ROADMAP
                                : window?.google?.maps?.MapTypeId?.TERRAIN
                            );
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover open={openSatelliteLabel}>
                    <PopoverTrigger
                      asChild
                      className='outline-none'
                      onMouseEnter={() => handleMouseEnter(true)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Button
                        variant={'ghost'}
                        className={`rounded-none hover:bg-primary hover:text-white ${
                          mapType ===
                            window?.google?.maps?.MapTypeId?.SATELLITE ||
                          mapType === window?.google?.maps?.MapTypeId?.HYBRID
                            ? 'bg-primary text-white'
                            : ''
                        }`}
                        onClick={() =>
                          changeMapType(
                            window?.google?.maps?.MapTypeId?.SATELLITE
                          )
                        }
                      >
                        Satellite
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      style={{ marginTop: -3 }}
                      className='ml-4 w-auto p-4 '
                      onMouseEnter={() => handleMouseEnter(true)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div>
                        <CheckboxItem
                          ariaLabel='Labels'
                          id={`Labels`}
                          tabIndex={-1}
                          checked={
                            mapType === window?.google?.maps?.MapTypeId?.HYBRID
                          }
                          onCheckedChange={() => {
                            changeMapType(
                              mapType ===
                                window?.google?.maps?.MapTypeId?.HYBRID
                                ? window?.google?.maps?.MapTypeId?.SATELLITE
                                : window?.google?.maps?.MapTypeId?.HYBRID
                            );
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : null}
          </div>
          <div className='flex justify-center px-4'>
            <TableComponent columns={columns} data={technicianList} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
