import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';

export class ProfileWorkspacePage extends BasePage {
  readonly backButton: Locator;
  readonly title: Locator;
  readonly customerId: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.backButton = page.getByRole('button', { name: /Back to My Workspace/i });
    this.title = page.locator('.profile-title');
    this.customerId = page.locator('dt', { hasText: 'Customer ID' }).locator('..').locator('dd');
    this.emptyMessage = page.getByText(/No profile is available/i);
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.backButton.waitFor({ state: 'visible' });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.profile);
  }

  async backToWorkspace(): Promise<void> {
    await this.backButton.click();
  }
}
