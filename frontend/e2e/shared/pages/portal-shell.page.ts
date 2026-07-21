import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../config/constants';
import { BasePage } from './base.page';

export type ShellNavTarget =
  | 'dashboard'
  | 'forms'
  | 'applications'
  | 'advisor'
  | 'profile';

/**
 * Authenticated portal chrome — brand, main nav, active state, logout (Sprint 02).
 * Extends Sprint 01 logout-only chrome into the full navigation matrix.
 * No assertions; no Workspace/Forms business interactions.
 */
export class PortalShellPage extends BasePage {
  readonly header: Locator;
  readonly brandLink: Locator;
  readonly mainNav: Locator;
  readonly dashboardLink: Locator;
  readonly formsLink: Locator;
  readonly applicationsLink: Locator;
  readonly advisorLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;
  readonly activeNavLink: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('header.portal-header');
    this.brandLink = page.getByRole('link', {
      name: /FormFlow Banking Portal home/i,
    });
    this.mainNav = page.getByRole('navigation', { name: /Main navigation/i });
    this.dashboardLink = this.mainNav.getByRole('link', { name: /^Dashboard$/i });
    this.formsLink = this.mainNav.getByRole('link', { name: /^Forms$/i });
    this.applicationsLink = this.mainNav.getByRole('link', {
      name: /^Applications$/i,
    });
    this.advisorLink = this.mainNav.getByRole('link', { name: /^Advisor$/i });
    this.profileLink = this.mainNav.getByRole('link', { name: /^Profile$/i });
    this.logoutButton = page.getByRole('button', { name: /Logout/i });
    this.activeNavLink = this.mainNav.locator('a.portal-nav-link-active');
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.header.waitFor({ state: 'visible' });
    await this.logoutButton.waitFor({ state: 'visible' });
  }

  /** Open dashboard under an already-authenticated session. */
  async openDashboard(): Promise<void> {
    await this.goto(ROUTES.dashboard);
  }

  async clickBrand(): Promise<void> {
    await this.brandLink.click();
  }

  async goToDashboard(): Promise<void> {
    await this.dashboardLink.click();
  }

  /** Shell "Forms" item — routes to dashboard `#workflows` (not form fill). */
  async goToFormsFragment(): Promise<void> {
    await this.formsLink.click();
  }

  /** Shell "Applications" item — routes to dashboard `#applications`. */
  async goToApplicationsFragment(): Promise<void> {
    await this.applicationsLink.click();
  }

  async goToAdvisor(): Promise<void> {
    await this.advisorLink.click();
  }

  async goToProfile(): Promise<void> {
    await this.profileLink.click();
  }

  async navigateTo(target: ShellNavTarget): Promise<void> {
    switch (target) {
      case 'dashboard':
        await this.goToDashboard();
        return;
      case 'forms':
        await this.goToFormsFragment();
        return;
      case 'applications':
        await this.goToApplicationsFragment();
        return;
      case 'advisor':
        await this.goToAdvisor();
        return;
      case 'profile':
        await this.goToProfile();
        return;
    }
  }

  /** Locator for a specific nav link (for active-state checks in specs). */
  navLink(target: Exclude<ShellNavTarget, 'forms' | 'applications'>): Locator {
    switch (target) {
      case 'dashboard':
        return this.dashboardLink;
      case 'advisor':
        return this.advisorLink;
      case 'profile':
        return this.profileLink;
    }
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
