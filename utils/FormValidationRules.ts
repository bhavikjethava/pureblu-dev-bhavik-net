// FormValidationRules.ts
import {
  isRequired,
  isValidEmail,
  isValidNumber,
  isValidPhoneNumber,
} from './ValidationUtils';
import { ERROR_MESSAGES } from './ValidationUtils';

interface FormData {
  field: string;
  value: string;
  message?: string;
  type?: string;
  customMessage?: string;
}

interface FormErrors {
  [Key: string]: string;
}

export const VALIDATIONTYPE = {
  ISPHONE: 'phone',
  ISEMAIL: 'email',
  ISDROPDOWN: 'dropdown',
  ISOTP: 'otp',
  ISFILE: 'file',
  ISZIP: 'zip',
};

// export const validateForm = (formData: {
//   email?: string;
//   password?: string;
//   phone?: string;
//   otp?: string;
// }): { email?: string; password?: string; phone?: string; otp?: string } => {
//   const newErrors: {
//     email?: string;
//     password?: string;
//     phone?: string;
//     otp?: string;
//   } = {};

//   // Check if phone is required
//   if (formData.phone !== undefined) {
//     if (!isRequired(formData.phone)) {
//       newErrors.phone = ERROR_MESSAGES.phone.required;
//     } else if (!isValidPhoneNumber(formData.phone)) {
//       newErrors.phone = ERROR_MESSAGES.phone.invalid;
//     }
//   }

//   // Check if otp is required
//   if (formData.otp !== undefined) {
//     if (!isRequired(formData.otp)) {
//       newErrors.phone = ERROR_MESSAGES.otp.required;
//     }
//   }

//   // Check if email is required
//   if (formData.email !== undefined) {
//     if (!isRequired(formData.email)) {
//       newErrors.email = ERROR_MESSAGES.email.required;
//     } else if (!isValidEmail(formData.email)) {
//       newErrors.email = ERROR_MESSAGES.email.invalid;
//     }
//   }

//   // Check if password is required
//   if (formData.password !== undefined) {
//     if (!isRequired(formData.password)) {
//       newErrors.password = ERROR_MESSAGES.password.required;
//     } else if (formData.password.length < 6) {
//       newErrors.password = ERROR_MESSAGES.password.length;
//     }
//   }

//   return newErrors;
// };

export const validateForm = (formData: Array<FormData>) => {
  const errors = {} as FormErrors;
  formData.map((data: any) => {
    const { field, value, type, message, customMessage } = data;
    let isEmpty = !isRequired(value);
    if (isEmpty) {
      errors[field] = customMessage
        ? customMessage
        : `${message}${ERROR_MESSAGES.required}`;
    }

    if (!isEmpty) {
      switch (type) {
        case VALIDATIONTYPE.ISPHONE: {
          if (!isValidPhoneNumber(value, data?.phoneLength)) {
            errors[field] = customMessage
              ? customMessage
              : `${message}${ERROR_MESSAGES.invalid}`;
          }
          break;
        }
        case VALIDATIONTYPE.ISEMAIL: {
          if (!isValidEmail(value)) {
            errors[field] = customMessage
              ? customMessage
              : `${ERROR_MESSAGES.valid}${message}`;
          }
          break;
        }
        case VALIDATIONTYPE.ISZIP: {
          if (!isValidNumber(value)) {
            errors[field] = customMessage
              ? customMessage
              : `${message}${ERROR_MESSAGES.invalid}`;
          }
          break;
        }
        // case VALIDATIONTYPE.ISOTP: {
        //   if (!isRequired(formData.otp)) {
        //     errors[field] = customMessage
        //       ? customMessage
        //       : `${ERROR_MESSAGES.valid}${message}`;
        //   }
        //   break;
        // }
        default: {
          break;
        }
      }
    }
  });

  let isError = Object.keys(errors).length > 0;
  return { isError, errors };
};
