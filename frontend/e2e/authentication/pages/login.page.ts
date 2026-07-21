import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';

export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Login page — UI interactions only; no assertions (Sprint 01).
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly fieldErrors: Locator;
  readonly bannerError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#login-email');
    // PrimeNG p-password uses inputId → #login-password
    this.passwordInput = page.locator('#login-password');
    // PrimeNG p-button: prefer form submit (accessible name can include icon text)
    this.submitButton = page.locator('form.auth-form button[type="submit"]');
    this.registerLink = page.getByRole('link', { name: /Create an account/i });
    this.fieldErrors = page.locator('small.auth-error');
    this.bannerError = page.getByRole('alert').locator('.p-message-text').first();
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async open(returnUrl?: string): Promise<void> {
    if (returnUrl) {
      await this.goto(`${ROUTES.login}?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      await this.goto(ROUTES.login);
    }
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.fillEmail(credentials.email);
    await this.fillPassword(credentials.password);
    await this.submit();
  }

  async goToRegister(): Promise<void> {
    await this.registerLink.click();
  }
}
