import type { BrowserContext, Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { DataSetupAdapter } from '../../shared/adapters/data-setup.adapter';
import { AUTH_STORAGE_KEYS, ROUTES } from '../../shared/config/constants';
import type { ViewportPack } from '../data';

/** Apply a viewport pack (in-test; no Playwright project change required). */
export async function applyViewport(
  page: Page,
  pack: ViewportPack,
): Promise<void> {
  await page.setViewportSize({ width: pack.width, height: pack.height });
}

/** Clear auth session keys — simulates session expiry (product has no TTL). */
export async function clearSession(page: Page): Promise<void> {
  await page.evaluate((keys) => {
    window.localStorage.removeItem(keys.currentUser);
    window.localStorage.removeItem(keys.isLoggedIn);
  }, AUTH_STORAGE_KEYS);
}

/** Force browser offline mode for the context. */
export async function setOffline(
  context: BrowserContext,
  offline: boolean,
): Promise<void> {
  await context.setOffline(offline);
}

/** Abort matching requests (network failure simulation). */
export async function abortRequests(
  page: Page,
  urlPattern: string | RegExp,
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    await route.abort('failed');
  });
}

/**
 * Tab until a locator is focused (bounded). Returns true if focused within maxTabs.
 */
export async function tabUntilFocused(
  page: Page,
  target: Locator,
  maxTabs = 40,
): Promise<boolean> {
  for (let i = 0; i < maxTabs; i++) {
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) {
      return true;
    }
    await page.keyboard.press('Tab');
  }
  return target
    .evaluate((el) => el === document.activeElement)
    .catch(() => false);
}

/** Collect pageerror messages for a critical navigation window. */
export async function collectPageErrors(
  page: Page,
  action: () => Promise<void>,
): Promise<string[]> {
  const errors: string[] = [];
  const handler = (err: Error) => {
    errors.push(err.message);
  };
  page.on('pageerror', handler);
  try {
    await action();
  } finally {
    page.off('pageerror', handler);
  }
  return errors;
}

/** Reset + login helper for quality specs that need a clean auth session. */
export async function ensureAuthenticated(
  page: Page,
  dataSetup: DataSetupAdapter,
  user: {
    id?: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
  },
): Promise<void> {
  await dataSetup.reset(page);
  await dataSetup.loginAs(page, user);
  await page.goto(ROUTES.dashboard);
  await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
}

export { ROUTES, AUTH_STORAGE_KEYS };
