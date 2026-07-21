import { uniqueEmail, uniqueMobile } from '../../shared/utils/random.helper';
import { VALID_AUTH_PASSWORD, VALID_AUTH_PASSWORD_MIN } from './users.valid';

/** Register field / service validation copy (values only). */
export const REGISTER_FIELD_ERROR_MESSAGES = {
  fullName: 'Full name is required (at least 3 characters).',
  email: 'Enter a valid email address.',
  mobile: 'Enter a valid 10-digit Indian mobile number.',
  password: 'Password must be at least 6 characters.',
  confirmMismatch: 'Password and confirm password do not match.',
} as const;

export const REGISTER_BANNER_ERROR_MESSAGES = {
  allRequired: 'All fields are required.',
  duplicateEmail: 'An account with this email already exists.',
} as const;

export type RegisterFormValues = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
};

/**
 * Registration boundary / negative payloads (fresh unique fields per call).
 */
export function registerBoundaryCases(): Record<string, RegisterFormValues> {
  return {
    emptyRequired: {
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
    },
    shortFullName: {
      fullName: 'Ab',
      email: uniqueEmail('bound'),
      mobileNumber: uniqueMobile(),
      password: VALID_AUTH_PASSWORD,
      confirmPassword: VALID_AUTH_PASSWORD,
    },
    invalidEmailFormat: {
      fullName: 'FormFlow Bound User',
      email: 'bad-email',
      mobileNumber: uniqueMobile(),
      password: VALID_AUTH_PASSWORD,
      confirmPassword: VALID_AUTH_PASSWORD,
    },
    mobileStartsWithFive: {
      fullName: 'FormFlow Bound User',
      email: uniqueEmail('bound'),
      mobileNumber: '5123456789',
      password: VALID_AUTH_PASSWORD,
      confirmPassword: VALID_AUTH_PASSWORD,
    },
    mobileTooShort: {
      fullName: 'FormFlow Bound User',
      email: uniqueEmail('bound'),
      mobileNumber: '987654321',
      password: VALID_AUTH_PASSWORD,
      confirmPassword: VALID_AUTH_PASSWORD,
    },
    mobileTooLong: {
      fullName: 'FormFlow Bound User',
      email: uniqueEmail('bound'),
      mobileNumber: '98765432101',
      password: VALID_AUTH_PASSWORD,
      confirmPassword: VALID_AUTH_PASSWORD,
    },
    passwordTooShort: {
      fullName: 'FormFlow Bound User',
      email: uniqueEmail('bound'),
      mobileNumber: uniqueMobile(),
      password: '12345',
      confirmPassword: '12345',
    },
    confirmMismatch: {
      fullName: 'FormFlow Bound User',
      email: uniqueEmail('bound'),
      mobileNumber: uniqueMobile(),
      password: VALID_AUTH_PASSWORD,
      confirmPassword: 'OtherPass1',
    },
  };
}

/** Positive boundary: minimum-length name + password that still pass validators. */
export function minValidRegisterUser(): RegisterFormValues {
  return {
    fullName: 'Abc',
    email: uniqueEmail('min'),
    mobileNumber: uniqueMobile(),
    password: VALID_AUTH_PASSWORD_MIN,
    confirmPassword: VALID_AUTH_PASSWORD_MIN,
  };
}

/** Invalid mobile samples for data-driven mobile pattern checks. */
export const invalidMobileSamples = [
  '5123456789',
  '987654321',
  '98765432101',
  'abcdefghij',
  '0987654321',
] as const;
