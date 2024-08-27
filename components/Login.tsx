import React, { FC, useCallback, useEffect, useState } from 'react';
import { LogoImg } from './Logo';
import { Button } from './ui/button';
import InputField from './InputField';
import {
  IconBxErrorCircle,
  IconEdit,
  IconLoading,
  IconLogIn,
  IconPencil,
} from '@/utils/Icons';
import OTPVerification from './OTPInput';
import { showToast } from './Toast';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import { VALIDATIONTYPE, validateForm } from '@/utils/FormValidationRules';
import { useApiResource } from '@/hooks/api';
import { MAXPHONE, getAuthTypeFromUrl } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import { ERROR_MESSAGES } from '@/utils/ValidationUtils';

const SECOND = 60;
let timeoutId: any;
interface LoginProps {
  title?: string;
  buttonText?: string;
}

interface FormData {
  phone: string;
  auth_type: string;
  otp?: string;
  request_secrete?: string;
}

/**
 * Login component is a form for user login.
 */
const Login: FC<LoginProps> = ({
  title = 'Dashboard',
  buttonText = 'Login',
}) => {
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpReceived, setOtpReceived] = useState(false);
  const match = pathname.match(/\/([a-zA-Z]+)/);

  const [formData, setFormData] = useState<FormData>({
    phone: '',
    auth_type: getAuthTypeFromUrl(match),
    otp: undefined,
  });
  const [timer, setTimer] = useState(0);
  const { getOtp, loginUser } = useApiResource(
    'loginUserQuery',
    API_ENDPOINTS.VERIFY_PHONE
  );

  const timerCallback = useCallback(
    () => setTimer((currTimer) => currTimer - 1),
    []
  );

  useEffect(() => {
    if ((formData?.otp?.length || 0) > 3) onVerifyOtp();
  }, [formData?.otp]);

  useEffect(() => {
    if (timer > 0) {
      timeoutId = setTimeout(timerCallback, 1000);
    }

    return () => {
      clearTimeout(timeoutId); // Clear the timeout when the component unmounts or timer is reset
    };
  }, [timer, timerCallback]);

  const resetTimer = function () {
    if (!timer) {
      setTimer(SECOND);
    }
  };

  const cancelTimer = function () {
    clearTimeout(timeoutId);
    setTimer(0);
  };

  /**
   * Handles the click event of the login button.
   */
  const handleGetOtp = async () => {
    try {
      // Start the loading state
      setLoading(true);

      // Perform form validation
      const valifationRules = [
        {
          field: 'phone',
          value: formData.phone,
          message: 'Mobile Number',
          type: VALIDATIONTYPE.ISPHONE,
        },
      ];
      const { isError, errors } = validateForm(valifationRules);

      if (isError) {
        // If validation fails, set the errors and return early
        setErrors(errors);
        return;
      }

      const { data } = await getOtp.mutateAsync({
        endpoint: API_ENDPOINTS.VERIFY_PHONE,
        method: 'POST',
        body: formData,
      });

      const apiData = (await data) as {
        request_secrete?: string;
        otp?: string;
      };

      if (apiData && apiData.request_secrete) {
        // Update the state with the received request_secrete
        setFormData((prevData) => ({
          ...prevData,
          request_secrete: apiData.request_secrete,
        }));
        // Set otpReceived to true to render the OTP input field
        setOtpReceived(true);
        resetTimer();
      }
    } catch (error: any) {
      console.error('An error occurred:', error);

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

  const onVerifyOtp = async () => {
    if (!loading) {
      try {
        // Start the loading state
        setLoading(true);

        // Perform form validation

        const valifationRules = [
          { field: 'otp', value: formData.otp || '', message: 'OTP' },
        ];
        const { isError, errors } = validateForm(valifationRules);
        if (isError) {
          // If validation fails, set the errors and return early
          setErrors(errors);
          return;
        }

        if ((formData?.otp || '')?.length < 4) {
          errors['otp'] = `${ERROR_MESSAGES.valid} OTP`;
          setErrors(errors);
          return;
        }

        const loginData = await loginUser.mutateAsync({
          endpoint: API_ENDPOINTS.LOGIN,
          method: 'POST',
          body: formData,
        });
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
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    setErrors({});
  };

  const onChangePhone = () => {
    setOtpReceived(false);
    cancelTimer();
    setErrors({});
  };

  return (
    <div className='m-auto w-full max-w-[400px]'>
      {/* Title section */}
      <div className='mb-3 flex items-center justify-center'>
        <h2 className='mb-5 max-w-xs text-center text-3xl text-primary'>
          <span className='font-bold'>Pureblu</span> {title}
        </h2>
      </div>

      {/* Login form section */}
      <div className='mb-5 flex w-full flex-col gap-5 rounded-xl bg-white p-8 shadow-2xl'>
        {/* Logo section */}
        <div className='mb-3 flex items-center justify-center'>
          <LogoImg alt='Pureblu Logo' />
        </div>

        {otpReceived ? (
          <>
            {/* otp input field */}
            <div className='flex text-center'>
              <div className='text-[13px] font-medium'>
                OTP has been sent to your mobile{' '}
                <span className='font-bold'>{formData?.phone}</span>
                <Button
                  className='ml-2'
                  variant={'link'}
                  onClick={onChangePhone}
                  icon={<IconPencil />}
                />
              </div>
            </div>
            <OTPVerification
              onOTPChange={(otp) => handleInputChange('otp', otp.join(''))}
              onSubmit={onVerifyOtp}
            />
            {errors?.otp && (
              <div className='mt-1 text-xs text-pbHeaderRed'>{errors?.otp}</div>
            )}
            <div className='flex items-center text-center'>
              <span className='font-medium'>Did not receive OTP?</span>
              <Button
                className='mx-1'
                variant={'link'}
                onClick={handleGetOtp}
                disabled={timer != 0}
              >
                Resend OTP
              </Button>
              {timer > 0 ? (
                <span>{`in ${timer < 10 ? '0' + timer : timer} sec`}</span>
              ) : null}
            </div>

            {/* Verify OTP button */}
            <Button
              className='active:bg-secondary-active active:shadow-innerButton'
              onClick={onVerifyOtp}
              aria-label='Get OTP'
              icon={loading ? <IconLoading /> : ''}
              disabled={loading}
            >
              Login
            </Button>
          </>
        ) : (
          <>
            {/* phone input field */}
            <InputField
              type='tel'
              maxLength={MAXPHONE}
              name='phone'
              value={formData?.phone}
              placeholder='Mobile Number'
              aria-label='Mobile Number'
              onChange={(e) => handleInputChange('phone', e)}
              error={errors?.phone} // Pass email error to InputField
              onSubmit={handleGetOtp}
              focus={true}
            />

            {/* Get OTP button */}
            <Button
              className='active:bg-secondary-active active:shadow-innerButton'
              onClick={handleGetOtp}
              aria-label='Get OTP'
              icon={loading ? <IconLoading /> : ''}
              disabled={loading}
            >
              {buttonText}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
