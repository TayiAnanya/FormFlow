import { uniqueEmail, uniqueMobile } from '../../shared/utils/random.helper';

/** Password meeting app rule (≥ 6 characters). Not production credentials. */
export const VALID_AUTH_PASSWORD = 'Secret1';

/** Exactly-minimum valid password length for boundary-positive cases. */
export const VALID_AUTH_PASSWORD_MIN = 'abcdef';

export type ValidRegisterUser = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
};

export type ValidSeedUser = {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
};

export type ValidLoginCredentials = {
  email: string;
  password: string;
};

/** Fresh unique registration payload (parallel-safe). */
export function validRegisterUser(
  overrides: Partial<ValidRegisterUser> = {},
): ValidRegisterUser {
  const password = overrides.password ?? VALID_AUTH_PASSWORD;
  return {
    fullName: overrides.fullName ?? 'FormFlow Auth User',
    email: overrides.email ?? uniqueEmail('auth'),
    mobileNumber: overrides.mobileNumber ?? uniqueMobile(),
    password,
    confirmPassword: overrides.confirmPassword ?? password,
  };
}

/** Seedable user for adapter loginAs / seedUser (parallel-safe). */
export function validSeedUser(overrides: Partial<ValidSeedUser> = {}): ValidSeedUser {
  const stamp = Date.now();
  return {
    id: overrides.id ?? `user-${stamp}`,
    fullName: overrides.fullName ?? 'FormFlow Seed User',
    email: overrides.email ?? uniqueEmail('seed'),
    mobileNumber: overrides.mobileNumber ?? uniqueMobile(),
    password: overrides.password ?? VALID_AUTH_PASSWORD,
  };
}

/** Login credentials derived from a known user profile. */
export function validLoginFromUser(user: {
  email: string;
  password: string;
}): ValidLoginCredentials {
  return { email: user.email, password: user.password };
}
