import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';

/**
 * Guest landing page — entry to Login / Register only (Sprint 01).
 * Full landing content assertions are out of scope.
 */
export class LandingPage extends BasePage {
  readonly navLogin: Locator;
  readonly navRegister: Locator;
  readonly heroLogin: Locator;
  readonly heroRegister: Locator;

  constructor(page: Page) {
    super(page);
    this.navLogin = page.locator('.lp-nav-login');
    this.navRegister = page.locator('.lp-nav-register');
    this.heroLogin = page.getByRole('link', { name: /Login to workspace/i });
    this.heroRegister = page.getByRole('link', { name: /Open an account/i });
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.navLogin.waitFor({ state: 'visible' });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.landing);
  }

  async goToLoginFromNav(): Promise<void> {
    await this.navLogin.click();
  }

  async goToRegisterFromNav(): Promise<void> {
    await this.navRegister.click();
  }

  async goToLoginFromHero(): Promise<void> {
    await this.heroLogin.click();
  }

  async goToRegisterFromHero(): Promise<void> {
    await this.heroRegister.click();
  }
}
