import type { Page } from '@playwright/test';

/**
 * Thin base page — readiness hook only. No business locators (Sprint 00).
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Override in concrete pages (Sprint 01+) to wait for page-specific readiness. */
  async expectReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.expectReady();
  }
}
