import type { Page } from '@playwright/test';

import { AUTH_STORAGE_KEYS } from '../../shared/config/constants';

/** Snapshot of FormFlow auth localStorage keys (read-only). */
export type AuthStorageSnapshot = {
  isLoggedIn: string | null;
  currentUserJson: string | null;
  usersJson: string | null;
};

/**
 * Reads auth keys via the page context.
 * Specs must not call `localStorage.setItem` — use DataSetupAdapter for writes.
 */
export async function readAuthStorage(page: Page): Promise<AuthStorageSnapshot> {
  return page.evaluate((keys) => {
    return {
      isLoggedIn: window.localStorage.getItem(keys.isLoggedIn),
      currentUserJson: window.localStorage.getItem(keys.currentUser),
      usersJson: window.localStorage.getItem(keys.users),
    };
  }, AUTH_STORAGE_KEYS);
}

export function parseCurrentUser(
  currentUserJson: string | null,
): Record<string, unknown> | null {
  if (!currentUserJson) {
    return null;
  }
  return JSON.parse(currentUserJson) as Record<string, unknown>;
}

export function parseBankUsers(
  usersJson: string | null,
): Array<Record<string, unknown>> {
  if (!usersJson) {
    return [];
  }
  return JSON.parse(usersJson) as Array<Record<string, unknown>>;
}
