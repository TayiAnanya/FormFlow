import type { Page } from '@playwright/test';

import {
  AuthenticatedChromePage,
  LoginPage,
  RegisterPage,
  type LoginCredentials,
  type RegisterFormData,
} from '../pages';
import { uniqueEmail, uniqueMobile } from '../../shared/utils/random.helper';

/** Default password meeting app rule (≥ 6 characters). */
export const DEFAULT_AUTH_PASSWORD = 'Secret1';

export type RegisteredUserHandle = RegisterFormData;

export type LoginResult = LoginCredentials;

export type LoginWithReturnUrlResult = {
  credentials: LoginCredentials;
  intendedReturnUrl: string;
};

function buildRegisterData(overrides: Partial<RegisterFormData> = {}): RegisterFormData {
  const password = overrides.password ?? DEFAULT_AUTH_PASSWORD;
  return {
    fullName: overrides.fullName ?? 'FormFlow Auth User',
    email: overrides.email ?? uniqueEmail('auth'),
    mobileNumber: overrides.mobileNumber ?? uniqueMobile(),
    password,
    confirmPassword: overrides.confirmPassword ?? password,
  };
}

/**
 * User Registration — open Register, fill, submit.
 * Does not assert destination; app auto-logs in on success.
 */
export async function register(
  page: Page,
  overrides: Partial<RegisterFormData> = {},
): Promise<RegisteredUserHandle> {
  const data = buildRegisterData(overrides);
  const registerPage = new RegisterPage(page);
  await registerPage.open();
  await registerPage.register(data);
  return data;
}

/**
 * Register and Enter Portal — unique valid user → submit → authenticated session (app behavior).
 * Specs own URL / storage assertions.
 */
export async function registerAndEnterPortal(
  page: Page,
  overrides: Partial<RegisterFormData> = {},
): Promise<RegisteredUserHandle> {
  return register(page, overrides);
}

/**
 * User Login — open Login, fill credentials, submit.
 */
export async function login(page: Page, credentials: LoginCredentials): Promise<LoginResult> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(credentials);
  return credentials;
}

/**
 * Logout — authenticated chrome → trigger logout.
 */
export async function logout(page: Page): Promise<void> {
  const chrome = new AuthenticatedChromePage(page);
  await chrome.logout();
}

/**
 * Login with Return URL — hit protected route as guest (guard → login), then submit credentials.
 * Specs assert final landing on the safe return URL.
 */
export async function loginWithReturnUrl(
  page: Page,
  credentials: LoginCredentials,
  protectedPath: string,
): Promise<LoginWithReturnUrlResult> {
  const loginPage = new LoginPage(page);
  // Guest hit of a guarded route; app redirects to /login?returnUrl=...
  await loginPage.goto(protectedPath);
  await loginPage.expectReady();
  await loginPage.login(credentials);
  return { credentials, intendedReturnUrl: protectedPath };
}
