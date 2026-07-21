import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';

export type AdvisorPhase = 'idle' | 'loading' | 'results' | 'error';

/**
 * Smart Banking Advisor page at /advisor (Sprint 06).
 * Covers the single-turn conversation → results flow.
 */
export class BankingAdvisorPage extends BasePage {
  readonly heading: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly startOverButton: Locator;
  readonly suggestions: Locator;
  readonly userBubble: Locator;
  readonly loadingIndicator: Locator;
  readonly loadingSteps: Locator;
  readonly activeLoadingSteps: Locator;
  readonly errorMessage: Locator;
  readonly resultsSection: Locator;
  readonly productCards: Locator;
  readonly insightCards: Locator;
  readonly healthScoreEl: Locator;
  readonly roadmapItems: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('.advisor-title');
    this.messageInput = page.locator('#advisor-message');
    // PrimeNG icon buttons expose accessible names like " Send" — match substring, not ^Send$
    this.sendButton = page
      .locator('.advisor-chat-actions')
      .getByRole('button', { name: /Send/i });
    this.startOverButton = page
      .locator('.advisor-chat-actions')
      .getByRole('button', { name: /Start over/i });
    this.suggestions = page.locator('.advisor-suggestion');
    this.userBubble = page.locator('.advisor-user-bubble');
    this.loadingIndicator = page.locator('.advisor-loading');
    this.loadingSteps = page.locator('ol.advisor-loading-steps li');
    this.activeLoadingSteps = page.locator('li.advisor-loading-active');
    // PrimeNG p-message[severity="warn"] renders [role="alert"] inside .advisor-page
    this.errorMessage = page.locator('.advisor-page [role="alert"]');
    this.resultsSection = page.locator('section.advisor-results');
    this.productCards = page.locator('.product-card');
    this.insightCards = page.locator('.insight-card');
    this.healthScoreEl = page.locator('.health-score');
    this.roadmapItems = page.locator('.roadmap-item');
  }

  override async expectReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.heading.waitFor({ state: 'visible' });
    await this.messageInput.waitFor({ state: 'visible' });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.advisor);
  }

  productCard(n: number): Locator {
    return this.productCards.nth(n);
  }

  productCardCta(n: number): Locator {
    return this.productCard(n).getByRole('button');
  }

  async fillMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    // Wait until Angular [(ngModel)] enables Send when the trimmed draft is non-empty
    if (text.trim().length > 0) {
      await expect(this.sendButton).toBeEnabled({ timeout: 5_000 });
    }
  }

  async submitMessage(): Promise<void> {
    await this.sendButton.click();
  }

  async startOver(): Promise<void> {
    await this.startOverButton.click();
  }

  async useSuggestion(n: number): Promise<void> {
    const suggestion = this.suggestions.nth(n);
    const label = (await suggestion.innerText()).trim();
    await suggestion.click();
    await expect(this.messageInput).toHaveValue(label);
  }

  async waitForResults(): Promise<void> {
    await this.resultsSection.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async waitForError(): Promise<void> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async waitForIdle(): Promise<void> {
    await expect(this.loadingIndicator).toBeHidden({ timeout: 15_000 });
    await expect(this.resultsSection).toBeHidden({ timeout: 5_000 });
  }

  async expectPhase(phase: AdvisorPhase): Promise<void> {
    switch (phase) {
      case 'idle':
        await expect(this.loadingIndicator).toBeHidden();
        await expect(this.resultsSection).toBeHidden();
        await expect(this.errorMessage).toBeHidden();
        break;
      case 'loading':
        await this.loadingIndicator.waitFor({ state: 'visible' });
        break;
      case 'results':
        await this.waitForResults();
        break;
      case 'error':
        await this.waitForError();
        break;
    }
  }

  async healthScoreTone(): Promise<string | null> {
    await this.healthScoreEl.waitFor({ state: 'visible' });
    return this.healthScoreEl.getAttribute('data-tone');
  }
}
