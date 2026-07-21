import { VALID_AUTH_PASSWORD } from './users.valid';

/** Banner / service messages for invalid login (values only). */
export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'Invalid email or password.',
  required: 'Email and password are required.',
} as const;

/**
 * Invalid login credential packs.
 * For wrong-password cases, pair with a seeded user via `wrongPasswordFor(email)`.
 */
export const invalidLoginUsers = {
  unknownEmail: {
    email: 'unknown.user@example.test',
    password: VALID_AUTH_PASSWORD,
  },
  malformedEmail: {
    email: 'not-an-email',
    password: VALID_AUTH_PASSWORD,
  },
} as const;

/** Wrong password against an already-seeded email. */
export function wrongPasswordFor(seededEmail: string): {
  email: string;
  password: string;
} {
  return {
    email: seededEmail,
    password: 'WrongPass1',
  };
}
