import { VALID_AUTH_PASSWORD } from './users.valid';

/**
 * Login form validation cases (empty / partial fields).
 * Specs drive LoginPage with these values.
 */
export const loginValidationCases = {
  emptyBoth: {
    email: '',
    password: '',
  },
  emptyEmail: {
    email: '',
    password: VALID_AUTH_PASSWORD,
  },
  emptyPassword: {
    email: 'guest@example.test',
    password: '',
  },
  whitespaceEmail: {
    email: '   ',
    password: VALID_AUTH_PASSWORD,
  },
} as const;

/** Field-level copy shown after submitted invalid login form. */
export const LOGIN_FIELD_ERROR_MESSAGES = {
  email: 'Enter a valid email address.',
  password: 'Password is required.',
} as const;
