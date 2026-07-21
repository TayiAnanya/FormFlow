import { test as base } from '@playwright/test';

import {
  createAuthenticationFixtures,
  type AuthenticationFixtures,
} from '../../authentication/fixtures';
import {
  createWorkspaceFixtures,
  type WorkspaceFixtures,
} from '../../workspace/fixtures';
import {
  createStorageFixtures,
  type StorageFixtures,
} from './storage.fixture';

/**
 * Single Playwright `test` export — storage + auth + workspace fixtures.
 */
export const test = base.extend<
  StorageFixtures & AuthenticationFixtures & WorkspaceFixtures
>({
  ...createStorageFixtures(),
  ...createAuthenticationFixtures(),
  ...createWorkspaceFixtures(),
});

export { expect } from '@playwright/test';
