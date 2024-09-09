import React, { useContext, useEffect, useState } from 'react';
import EditableField from '../EditableField';
import DatepickerComponent from '../DatePicker';
import MultiSelectDropdown from '../MultiSelect';
import InputField from '../InputField';
import { Button } from '../ui/button';
import {
  IconBxErrorCircle,
  IconDeleteBinLine,
  IconDownload,
  IconLoading,
  IconPencil,
  IconPlayCircle,
} from '@/utils/Icons';
import { useMutation } from 'react-query';
import { apiCall, downloadFile } from '@/hooks/api';
import { validateForm } from '@/utils/FormValidationRules';
import moment from 'moment';
import { showToast } from '../Toast';
import ROUTES, {
  REFRESHCOMPLAINDETAIL,
  REFRESHCOMPLAINTLIST,
  REFRESHUNITSERVICELIST,
  TEXTAREA,
  getBaseUrl,
} from '@/utils/utils';
import Image from 'next/image';
import { DataContext } from '@/context/dataProvider';
import Loader from '../Loader';
import { usePathname } from 'next/navigation';
import ZoomImageModal from '../ZoomImageModal';
import ConfirmationDialog from '../ConfirmationDialog';

interface ServiceData {
  [key: string]: any;
}

interface CreateServiceReportDialogProps {
  isEdit?: boolean;
  technicianList: any;
  actionCheckList: any;
  sparePartsList: any;
  serviceActionList: any;
  apiBaseUrl: any;
  complaintDetail: any;
  reportData?: any;
  onClose: () => void;
}

const ServiceReportEdit: React.FC<CreateServiceReportDialogProps> = ({
  isEdit,
  technicianList,
  actionCheckList,
  serviceActionList,
  sparePartsList,
  apiBaseUrl,
  complaintDetail,
  reportData,
  onClose,
}) => {
  const apiAction = useMutation(apiCall);
  const { state, setData } = useContext(DataContext);
  const [editMode, setEditMode] = useState(!isEdit);
  const [serviceReportimage, setServiceReportimage] = useState<Blob[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ServiceData>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const [selectedValues, setSelectedValues] = useState<any>({
    technician: null,
    technician_id: null, // or any default value that makes sense
    checked_in_at: null,
    action_taken: [],
    check_report: [],
    replaced_spare_parts: [],
    require_spare_parts: [],
    report_image: [],
    other: '',
  });
  const [loadingClose, setLoadingClose] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    show: false,
    selectedItem: '',
  });

  const handalClose = () => {
    onClose();
  };
  const pathname = usePathname();
  const basePath = getBaseUrl(pathname);
  const isEnterprise = basePath == ROUTES.ENTERPRISE;

  useEffect(() => {
    if (isEdit) {
      // Extract the data from the provided object
      const {
        id,
        technician_id,
        technician,
        checked_in_at,
        action_taken,
        check_report,
        replaced_spare_parts,
        require_spare_parts,
        other,
        report_image,
      } = reportData;

      // Set the selected values based on the extracted data
      setSelectedValues({
        technician: technician,
        technician_id: technician_id,
        checked_in_at: checked_in_at ? new Date(checked_in_at) : null,
        action_taken: action_taken,
        check_report: check_report,
        replaced_spare_parts: replaced_spare_parts,
        require_spare_parts: require_spare_parts,
        report_image: report_image,
        other,
      });
    }
  }, [isEdit, reportData]);

  const handleSelectChange = (field: string, newValues: any) => {
    setSelectedValues((prevState: any) => ({
      ...prevState,
      [field]: newValues,
    }));
    setErrors({});
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e?.target?.files) {
      const files = Array.from(e.target.files);
      const fileBlobs = await Promise.all(
        files.map((file) => new Blob([file]))
      );
      setServiceReportimage(fileBlobs);
    }
  };

  const isPastDate = (date: string) => {
    return moment(date).isBefore(moment());
  };

  const saveServiceReport = async (status: string) => {
    try {
      // Start the loading state
      if (
        status === 'is_closed' &&
        !confirmationDialog?.show &&
        selectedValues?.require_spare_parts?.length > 0
      ) {
        // setLoadingClose(true);
        setConfirmationDialog({
          show: true,
          selectedItem: 'is_closed',
        });
        return;
      } else if (status === 'pending') {
        setLoadingPending(true);
      }
      // Validation
      const formData: any = new FormData();

      const validationRules = [
        {
          field: 'technician_id',
          value: selectedValues?.technician_id,
          message: 'Technician',
        },
        {
          field: 'checked_in_at',
          value: selectedValues?.checked_in_at,
          message: 'check in date',
        },
      ];

      let { isError, errors } = validateForm(validationRules);

      // Custom validation for checked_in_at to be a future date
      if (!isPastDate(selectedValues?.checked_in_at)) {
        isError = true;
        errors.checked_in_at =
          'The Check in date field must be a date before or equal to now.';
      }

      if (isError) {
        setErrors(errors);
      } else {
        formData.append(
          'checked_in_at',
          moment(selectedValues?.checked_in_at || new Date()).format(
            'YYYY-MM-DD HH:mm'
          )
        );
        formData.append('technician_id', selectedValues.technician_id);
        formData.append('other', selectedValues.other); // Add this line to include the "other" field

        if (selectedValues?.action_taken?.length > 0) {
          selectedValues?.action_taken?.forEach((action: any) =>
            formData.append('action_taken_ids[]', action.id)
          );
        } else {
          formData.append('action_taken_ids[]', []);
        }

        if (selectedValues?.require_spare_parts?.length > 0) {
          selectedValues?.require_spare_parts?.forEach((part: any) =>
            formData.append('require_spare_parts_ids[]', part.id)
          );
        } else {
          formData.append('require_spare_parts_ids[]', []);
        }

        if (selectedValues?.replaced_spare_parts?.length > 0) {
          selectedValues?.replaced_spare_parts?.forEach((part: any) =>
            formData.append('replaced_spare_parts_ids[]', part.id)
          );
        } else {
          formData.append('replaced_spare_parts_ids[]', []);
        }

        if (selectedValues?.check_report?.length > 0) {
          selectedValues?.check_report?.forEach((report: any) =>
            formData.append('action_check_list_ids[]', report.id)
          );
        } else {
          formData.append('action_check_list_ids[]', []);
        }

        formData.append('request_status', status);

        // Append files if they exist
        if (serviceReportimage && serviceReportimage.length > 0) {
          serviceReportimage.forEach((file, index) => {
            formData.append(`report_files[${index}]`, file); // Append each file
          });
        }
        //post service
        postServiceReport(formData, status);
      }
    } catch (e) {
      console.log('====>', e);
    }
  };

  // post service report
  const postServiceReport = async (formData: any, status: string) => {
    try {
      if (status === 'is_closed') {
        setLoadingClose(true);
      }
      const isEdit = reportData?.id;
      let apiUrl;

      if (isEdit) {
        apiUrl = `${apiBaseUrl.CUSTOMERS}/${complaintDetail.customer_id}/request/${reportData?.request_id}/service-report/${reportData.id}?_method=patch`;
      } else {
        apiUrl = `${apiBaseUrl.CUSTOMERS}/${complaintDetail.customer_id}/request/${complaintDetail?.id}/service-report`;
      }

      const technician = {
        endpoint: apiUrl,
        method: 'POST',
        body: formData,
        isFormData: true,
      };

      const response = await apiAction.mutateAsync(technician);

      if (response?.isError) {
        setErrors(response.errors);
      } else {
        setErrors({});
        setData({ ...state, [REFRESHCOMPLAINTLIST]: Date.now() }); // Update the state to trigger the API call
        if (isEdit) {
          setEditMode(false);
          setConfirmationDialog({
            show: false,
            selectedItem: '',
          });
        } else {
          handalClose();
        }
        setSelectedValues(response.data);
        setData({ [REFRESHUNITSERVICELIST]: Date.now() });
        if (status === 'is_closed' || isEdit) {
          setData({ [REFRESHCOMPLAINDETAIL]: Date.now() });
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
      setLoadingClose(false);
      setLoadingPending(false);
    }
  };

  const downloadServiceReport = async (): Promise<void> => {
    setLoading(true);
    try {
      const endpoint: string = `${apiBaseUrl.CUSTOMERS}/${complaintDetail.customer_id}/request/${reportData?.request_id}/service-report/${reportData.id}/download`;

      const blob: Blob = await downloadFile(endpoint);

      const blobUrl: string = window.URL.createObjectURL(blob);

      const a: HTMLAnchorElement = document.createElement('a');
      a.href = blobUrl;
      a.download = `service-report-${reportData.id}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download service report:', error);
      // Handle error gracefully (e.g., display a message to the user)
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedImage('');
  };

  const onCloseConfrimationDialogClose = () => {
    setConfirmationDialog({
      show: false,
      selectedItem: '',
    });
  };

  return (
    <div className='grid grid-cols-2 gap-4'>
      {!editMode && (
        <div className='col-span-full flex justify-end gap-5'>
          {!isEnterprise && (
            <Button
              className='p-2'
              onClick={() => setEditMode(!editMode)}
              size={'sm'}
            >
              <IconPencil className='h-5 w-5' />
            </Button>
          )}
          <Button
            className='p-2'
            onClick={() => downloadServiceReport()}
            size={'sm'}
          >
            <IconDownload className='h-5 w-5' />
          </Button>
        </div>
      )}
      <div>
        <EditableField
          label='Technician'
          useCustomStyle={true}
          size='md'
          options={technicianList}
          value={selectedValues?.technician?.name}
          selectedValue={selectedValues?.technician_id}
          handleSelectChange={(newValues: any) =>
            handleSelectChange('technician_id', newValues)
          }
          editMode={editMode}
          type='dropdown'
          error={errors?.technician_id}
        />
      </div>
      <div>
        {editMode ? (
          <DatepickerComponent
            label='Check In'
            showTimeSelect={true}
            dateFormat='dd/MM/yyyy HH:mm'
            maxDate={new Date()}
            minTime={new Date().setHours(0, 0, 0, 0)}
            maxTime={
              selectedValues?.checked_in_at &&
              new Date(selectedValues?.checked_in_at).toDateString() ===
                new Date().toDateString()
                ? new Date()
                : new Date().setHours(23, 59, 59, 999)
            }
            size='md'
            className='grid'
            onChange={(newDate: Date | null) =>
              handleSelectChange('checked_in_at', newDate)
            }
            selectedDate={selectedValues?.checked_in_at}
            error={errors?.checked_in_at}
          />
        ) : (
          <div>
            {' '}
            {<div className='mb-1  font-bold'>Check In</div>}
            {moment(selectedValues?.checked_in_at).format(
              'DD MMMM, YYYY hh:mm A'
            )}{' '}
          </div>
        )}
      </div>
      <div>
        {editMode ? (
          <MultiSelectDropdown
            options={serviceActionList}
            label='Action Taken'
            getOptionValue={(option) => option?.id} // Pass getOptionValue function
            getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
            onChange={(selectedValues: any) =>
              handleSelectChange('action_taken', selectedValues)
            }
            error={errors?.action_taken}
            value={selectedValues?.action_taken} // Pass selectedValues.action_taken as the value
          />
        ) : (
          <div>
            {' '}
            {<div className='mb-1  font-bold'>Action Taken</div>}
            {selectedValues?.action_taken?.length > 0 ? (
              selectedValues?.action_taken?.map((item: any) => (
                <div key={item?.name}>{item?.name}</div>
              ))
            ) : (
              <span className='text-xs italic opacity-65'>
                Data not available
              </span>
            )}
          </div>
        )}
      </div>
      <div>
        {editMode ? (
          <MultiSelectDropdown
            options={actionCheckList}
            label='Check Report'
            getOptionValue={(option) => option?.id} // Pass getOptionValue function
            getOptionLabel={(option) => option?.name} // Pass getOptionLabel function
            onChange={(selectedValues: any) =>
              handleSelectChange('check_report', selectedValues)
            }
            error={errors?.check_report}
            value={selectedValues?.check_report} // Pass selectedValues.action_taken as the value
          />
        ) : (
          <div>
            {' '}
            {<div className='mb-1  font-bold'>Check Report</div>}
            {selectedValues?.check_report?.length > 0 ? (
              selectedValues?.check_report?.map((item: any) => (
                <div key={item?.name}>{item?.name}</div>
              ))
            ) : (
              <span className='text-xs italic opacity-65'>
                Data not available
              </span>
            )}
          </div>
        )}
      </div>
      <div>
        {editMode ? (
          <MultiSelectDropdown
            options={sparePartsList}
            label='Replaced Spare Parts'
            getOptionValue={(option) => option.id} // Pass getOptionValue function
            getOptionLabel={(option) => option.particulars} // Pass getOptionLabel function
            onChange={(selectedValues: any) =>
              handleSelectChange('replaced_spare_parts', selectedValues)
            }
            error={errors?.replaced_spare_parts}
            value={selectedValues?.replaced_spare_parts} // Pass selectedValues.action_taken as the value
          />
        ) : (
          <div>
            {' '}
            {<div className='mb-1  font-bold'>Replaced Spare Parts</div>}
            {selectedValues?.replaced_spare_parts?.length > 0 ? (
              selectedValues?.replaced_spare_parts
                ?.map((item: any) => item.particulars)
                .join(', ')
            ) : (
              <span className='text-xs italic opacity-65'>
                Data not available
              </span>
            )}
          </div>
        )}
      </div>
      <div>
        {editMode ? (
          <MultiSelectDropdown
            options={sparePartsList}
            label='Require Spare Parts'
            getOptionValue={(option) => option.id} // Pass getOptionValue function
            getOptionLabel={(option) => option.particulars} // Pass getOptionLabel function
            onChange={(selectedValues: any) =>
              handleSelectChange('require_spare_parts', selectedValues)
            }
            error={errors?.require_spare_parts}
            value={selectedValues?.require_spare_parts} // Pass selectedValues.action_taken as the value
          />
        ) : (
          <div>
            {' '}
            {<div className='mb-1  font-bold'>Require Spare Parts</div>}
            {selectedValues?.require_spare_parts?.length > 0 ? (
              selectedValues?.require_spare_parts
                ?.map((item: any) => item.particulars)
                .join(', ')
            ) : (
              <span className='text-xs italic opacity-65'>
                Data not available
              </span>
            )}
          </div>
        )}
      </div>
      <div>
        <EditableField
          label='Other'
          type={TEXTAREA}
          value={selectedValues?.other || ''}
          editMode={editMode}
          onChange={(newValue: any) => handleSelectChange('other', newValue)}
        />
        {!selectedValues?.other && !editMode && (
          <span className='text-xs italic opacity-65'>Data not available</span>
        )}
      </div>
      <div>
        {editMode ? (
          <InputField
            type='file'
            label='images'
            accept='image/jpeg, image/png'
            multiple
            onChange={handleFileInputChange} // Remove the key parameter
            error={errors?.report_files || ''}
            className={'w-full'}
          />
        ) : (
          <div>
            {<div className='mb-1 font-bold'>Images</div>}
            <div className='flex flex-wrap gap-4'>
              {selectedValues?.report_image?.map((img: any, index: number) => {
                return (
                  <Image
                    key={index}
                    src={img?.image}
                    alt=''
                    width={60}
                    height={60}
                    className='cursor-pointer object-contain'
                    onClick={() => openDialog(img.image)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      {!editMode && reportData?.feedback && (
        <div>
          <div className='mb-1 flex items-center gap-2 font-bold'>
            <IconPlayCircle className='h-6 w-6 text-pbHeaderBlue' />
            Technician Feed
          </div>
          <div className='mt-4 flex gap-4'>
            <audio controls>
              <source
                src={`${reportData?.feedback?.technician_feedback}`}
                type='audio/mp4'
              />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
      {!isEnterprise && (
        <div>
          {editMode && (
            <div className='flex gap-4'>
              <Button
                variant={'outline'}
                icon={loadingClose ? <IconLoading /> : ''}
                onClick={() => saveServiceReport('is_closed')}
                disabled={loadingClose || loadingPending}
              >
                Close
              </Button>
              <Button
                onClick={() => saveServiceReport('pending')}
                icon={loadingPending ? <IconLoading /> : ''}
                disabled={loadingPending || loadingClose}
              >
                Pending
              </Button>
              {isEdit && (
                <Button
                  variant={'yellow'}
                  onClick={() => setEditMode(!editMode)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {loading ? <Loader /> : null}

      <ZoomImageModal
        isOpen={isDialogOpen}
        onRequestClose={closeDialog}
        imageSrc={selectedImage}
      />
      {confirmationDialog?.show && (
        <ConfirmationDialog
          isOpen={confirmationDialog.show}
          onClose={onCloseConfrimationDialogClose}
          buttons={[
            {
              text: 'Close',
              variant: 'outline',
              size: 'sm',
              onClick: () => saveServiceReport('is_closed'),
              disabled: loadingPending,
              btnLoading: loadingClose,
              icon: loadingClose ? <IconLoading /> : '',
            },
            {
              text: 'Pending',
              variant: 'default',
              size: 'sm',
              onClick: () => saveServiceReport('pending'),
              btnLoading: loadingPending,
              disabled: loadingClose,
              icon: loadingPending ? <IconLoading /> : '',
            },
          ]}
          ClassName='min-w-[45%]' // You can customize the dialog size class if needed
        >
          Are you sure you want to close the call? You have selected the
          following spare parts required:
          <br />
          <div className='text-left text-base font-medium'>
            {selectedValues?.require_spare_parts.map(
              (x: any, index: number) => (
                <>
                  <br />
                  <span>{`${index + 1}) ${x?.particulars}`}</span>
                </>
              )
            )}
          </div>
        </ConfirmationDialog>
      )}
    </div>
  );
};

export default ServiceReportEdit;
