import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';

export class ApplicationDetailPage extends BasePage {
  readonly backButton: Locator;
  readonly notFoundMessage: Locator;
  readonly applicationId: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.backButton = page.getByRole('button', { name: /Back to My Workspace/i });
    this.notFoundMessage = page.getByText(/Application not found for your account/i);
    this.applicationId = page.locator('.app-detail-id');
    this.title = page.locator('.app-detail-header h1');
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.backButton.waitFor({ state: 'visible' });
  }

  async open(applicationId: string): Promise<void> {
    await this.goto(ROUTES.application(applicationId));
  }

  async backToWorkspace(): Promise<void> {
    await this.backButton.click();
  }
}
