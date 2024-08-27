// ValidationUtils.ts
interface FormData {
  [key: string]: any;
}

export const ERROR_MESSAGES = {
  required: ' is required.',
  invalid: ' is invalid.',
  valid: 'Please enter valid ',
  fromDateGreater: 'To date must be greater than or equal to From date',
  fromToDateLimit: `'From Date' and 'To Date' must not exceed a maximum of 365 days.`
};

// Helper function to validate email format
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper function to validate phone number format
export const isValidNumber = (number: string, length?: number): boolean => {
  const regexPattern = length ? `^\\d{${length}}$` : '^\\d+$';
  const regex = new RegExp(regexPattern);
  return regex.test(number);
};

export const isValidPhoneNumber = (phoneNumber: string, phoneLength?: number) => {
  return isValidNumber(phoneNumber, phoneLength || 10);
};

export const isRequired = (value: string | number | undefined): boolean => {
  return (
    value !== undefined &&
    value?.toString()?.trim() !== '' &&
    value !== null &&
    value !== -1
  );
};
