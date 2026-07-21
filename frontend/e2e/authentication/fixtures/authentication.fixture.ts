import type { Page } from '@playwright/test';

import type { DataSetupAdapter, SeedUserInput } from '../../shared/adapters/data-setup.adapter';
import { uniqueEmail, uniqueMobile } from '../../shared/utils/random.helper';
import {
  DEFAULT_AUTH_PASSWORD,
  registerAndEnterPortal,
  type RegisteredUserHandle,
} from '../workflows/auth.workflow';

/**
 * Authenticated session established via DataSetupAdapter (not login UI).
 * Use for guards, session, and portal tests where login form is not under test.
 */
export type AuthenticatedUserContext = {
  page: Page;
  user: SeedUserInput;
};

/**
 * Session created through the Register UI workflow (app auto-login).
 * Use for post-register flows; prefer workflows directly when Register UI is under test.
 */
export type NewlyRegisteredUserContext = {
  page: Page;
  user: RegisteredUserHandle;
};

export type AuthenticationFixtures = {
  authenticatedUser: AuthenticatedUserContext;
  newlyRegisteredUser: NewlyRegisteredUserContext;
};

function buildSeedUser(overrides: Partial<SeedUserInput> = {}): SeedUserInput {
  const stamp = Date.now();
  return {
    id: overrides.id ?? `user-${stamp}`,
    fullName: overrides.fullName ?? 'FormFlow Auth User',
    email: overrides.email ?? uniqueEmail('auth'),
    mobileNumber: overrides.mobileNumber ?? uniqueMobile(),
    password: overrides.password ?? DEFAULT_AUTH_PASSWORD,
    registeredAt: overrides.registeredAt ?? new Date().toISOString(),
  };
}

/**
 * Auth fixtures — composable with Sprint 00 storage fixtures; no assertions.
 */
export function createAuthenticationFixtures() {
  return {
    authenticatedUser: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (ctx: AuthenticatedUserContext) => Promise<void>,
    ) => {
      await dataSetup.reset(page);
      const user = buildSeedUser();
      await dataSetup.loginAs(page, user);
      await use({ page, user });
    },

    newlyRegisteredUser: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (ctx: NewlyRegisteredUserContext) => Promise<void>,
    ) => {
      await dataSetup.reset(page);
      const user = await registerAndEnterPortal(page);
      await use({ page, user });
    },
  };
}
