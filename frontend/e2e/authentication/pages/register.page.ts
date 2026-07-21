import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';

export type RegisterFormData = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
};

/**
 * Register page — UI interactions only; no assertions (Sprint 01).
 */
export class RegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly fieldErrors: Locator;
  readonly bannerError: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#register-name');
    this.emailInput = page.locator('#register-email');
    this.mobileInput = page.locator('#register-mobile');
    this.passwordInput = page.locator('#register-password');
    this.confirmPasswordInput = page.locator('#register-confirm');
    this.submitButton = page.locator('form.auth-form button[type="submit"]');
    this.loginLink = page.getByRole('link', { name: /^Login$/i });
    this.fieldErrors = page.locator('small.auth-error');
    this.bannerError = page.getByRole('alert').locator('.p-message-text').first();
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.nameInput.waitFor({ state: 'visible' });
  }

  async open(returnUrl?: string): Promise<void> {
    if (returnUrl) {
      await this.goto(`${ROUTES.register}?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      await this.goto(ROUTES.register);
    }
  }

  async fill(data: RegisterFormData): Promise<void> {
    await this.nameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.mobileInput.fill(data.mobileNumber);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async register(data: RegisterFormData): Promise<void> {
    await this.fill(data);
    await this.submit();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
