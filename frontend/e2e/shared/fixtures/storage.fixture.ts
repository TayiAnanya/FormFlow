import type { Page } from '@playwright/test';

import type { DataSetupAdapter } from '../adapters/data-setup.adapter';
import { defaultDataSetupAdapter } from '../adapters/local-storage.adapter';

/**
 * Storage / guest fixture helpers (Sprint 00).
 * Auth fixtures live in `authentication/fixtures` and merge via `shared/fixtures/index.ts`.
 */
export type StorageFixtures = {
  dataSetup: DataSetupAdapter;
  guestPage: Page;
};

export function createStorageFixtures() {
  return {
    dataSetup: async (
      {}: object,
      use: (adapter: DataSetupAdapter) => Promise<void>,
    ) => {
      await use(defaultDataSetupAdapter);
    },

    guestPage: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (page: Page) => Promise<void>,
    ) => {
      await dataSetup.reset(page);
      await use(page);
    },
  };
}
