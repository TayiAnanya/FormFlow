import type { Page } from '@playwright/test';

import {
  loginWithReturnUrl,
  type LoginCredentials,
} from '../../authentication/workflows/auth.workflow';
import { ROUTES, type ScenarioId } from '../config/constants';
import { shellNavDestinations } from '../data/navigation';
import {
  PortalShellPage,
  type ShellNavTarget,
} from '../pages/portal-shell.page';

/** Re-export destinations from navigation data (single source of truth). */
export const SHELL_NAV_DESTINATIONS = shellNavDestinations;

export type NavigateShellResult = {
  shell: PortalShellPage;
  target: ShellNavTarget;
  intended: { path: string; hash?: string };
};

export type BrandHomeResult = {
  shell: PortalShellPage;
  intendedPath: string;
};

export type DeepLinkGuestResult = {
  shell: PortalShellPage;
  credentials: LoginCredentials;
  intendedReturnUrl: string;
};

export type DeepLinkFormResult = {
  shell: PortalShellPage;
  scenarioId: string;
  intendedPath: string;
};

export type LogoutNavResult = {
  intendedPath: string;
};

export type HistoryNavResult = {
  shell: PortalShellPage;
};

/**
 * Click a portal shell menu target. Specs assert URL / active state.
 */
export async function navigateShellTo(
  page: Page,
  target: ShellNavTarget,
): Promise<NavigateShellResult> {
  const shell = new PortalShellPage(page);
  await shell.expectReady();
  await shell.navigateTo(target);
  return {
    shell,
    target,
    intended: SHELL_NAV_DESTINATIONS[target],
  };
}

/**
 * Brand / logo → dashboard home.
 */
export async function clickBrandAndReturnHome(
  page: Page,
): Promise<BrandHomeResult> {
  const shell = new PortalShellPage(page);
  await shell.expectReady();
  await shell.clickBrand();
  return { shell, intendedPath: ROUTES.dashboard };
}

/**
 * Guest hits a protected URL → login with returnUrl → authenticated destination.
 * Reuses Sprint 01 `loginWithReturnUrl` (no duplicated auth logic).
 */
export async function deepLinkProtectedAsGuest(
  page: Page,
  credentials: LoginCredentials,
  protectedPath: string,
): Promise<DeepLinkGuestResult> {
  const result = await loginWithReturnUrl(page, credentials, protectedPath);
  const shell = new PortalShellPage(page);
  await shell.expectReady();
  return {
    shell,
    credentials: result.credentials,
    intendedReturnUrl: result.intendedReturnUrl,
  };
}

/**
 * Authenticated deep link to `/forms/:scenarioId` — route arrival / shell ready only.
 * Does not fill or submit forms.
 */
export async function deepLinkFormAsAuthenticated(
  page: Page,
  scenarioId: ScenarioId | string,
): Promise<DeepLinkFormResult> {
  const intendedPath = ROUTES.form(String(scenarioId));
  const shell = new PortalShellPage(page);
  await shell.goto(intendedPath);
  return {
    shell,
    scenarioId: String(scenarioId),
    intendedPath,
  };
}

/**
 * Shell logout → app navigates to login. Specs assert URL.
 */
export async function logoutToLogin(page: Page): Promise<LogoutNavResult> {
  const shell = new PortalShellPage(page);
  await shell.expectReady();
  await shell.logout();
  return { intendedPath: ROUTES.login };
}

/**
 * Browser history back. Returns a shell handle for further composition.
 */
export async function browserBack(page: Page): Promise<HistoryNavResult> {
  await page.goBack();
  return { shell: new PortalShellPage(page) };
}

/**
 * Browser history forward. Returns a shell handle for further composition.
 */
export async function browserForward(page: Page): Promise<HistoryNavResult> {
  await page.goForward();
  return { shell: new PortalShellPage(page) };
}
