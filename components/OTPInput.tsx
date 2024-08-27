import React, { ChangeEvent, useEffect, useRef } from 'react';
import { Input } from './ui/input';

interface OTPVerificationProps {
  onOTPChange: (otp: string[]) => void;
  onSubmit: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  onOTPChange,
  onSubmit,
}) => {
  const otpLength = 4;
  const [userEnteredOTP, setUserEnteredOTP] = React.useState<string[]>(
    Array(otpLength).fill('')
  );

  useEffect(() => {
    inputRefs.current[0]!.focus();
  }, []);
  const inputRefs = useRef<(any)[]>(
    Array(otpLength).fill(null)
  );

  const focusInput = (index: number) => {
    if (index >= 0 && index < otpLength && inputRefs.current[index]) {
      inputRefs.current[index]!.focus();
      inputRefs.current[index]!.select();
    }
  };

  const updateOTP = (value: string, index: number) => {
    // Create a new OTP array
    const newOTP = [...userEnteredOTP];
    // Update the new OTP array
    newOTP[index] = value;
    // Set the state with the new OTP array
    setUserEnteredOTP(newOTP);

    if (value === '' && index > 0) {
      // If the current input is empty and not the first input, move focus to the previous input
      focusInput(index - 1);
    } else if (index < otpLength - 1 && value !== '') {
      // If the current input is not the last input and has a value, move focus to the next input
      focusInput(index + 1);
    }

    // Use the new OTP array here
    onOTPChange(newOTP);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      updateOTP('', index);
    } else if (e.key === 'Enter') {
      onSubmit?.();
    } else {
      const value = e.target.value;
      const newOTP = [...userEnteredOTP];
      if (value != '' && value == newOTP[index]) {
        setTimeout(() => {
          focusInput(index + 1);
        });
      }
    }
  };

  return (
    <div>
      <div className='flex justify-between gap-4'>
        {userEnteredOTP.map((val, index) => (
          <Input
            key={index}
            type='text'
            maxLength={1}
            value={val}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateOTP(e.target.value, index)
            }
            onKeyDown={(e) => handleKeyPress(e, index)}
            ref={(input) => {
              inputRefs.current[index] = input;
            }}
            className='h-14 w-14 text-center'
          />
        ))}
      </div>
    </div>
  );
};

export default OTPVerification;
