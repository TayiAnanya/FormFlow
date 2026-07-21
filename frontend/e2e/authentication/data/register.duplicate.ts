import { validRegisterUser, validSeedUser, type ValidRegisterUser, type ValidSeedUser } from './users.valid';
import { REGISTER_BANNER_ERROR_MESSAGES } from './register.boundary';

/**
 * Duplicate registration scenario data.
 * Specs: seed (or register once) with `existing`, then attempt register again with same email.
 */
export type DuplicateRegistrationPack = {
  /** First account — seed via adapter or UI. */
  existing: ValidSeedUser;
  /** Second attempt — same email, otherwise valid fields. */
  attempt: ValidRegisterUser;
  expectedBanner: typeof REGISTER_BANNER_ERROR_MESSAGES.duplicateEmail;
};

export function duplicateRegistrationPack(): DuplicateRegistrationPack {
  const existing = validSeedUser({ fullName: 'Existing FormFlow User' });
  const attempt = validRegisterUser({
    fullName: 'Duplicate Attempt User',
    email: existing.email,
    password: existing.password,
    confirmPassword: existing.password,
  });

  return {
    existing,
    attempt,
    expectedBanner: REGISTER_BANNER_ERROR_MESSAGES.duplicateEmail,
  };
}
