import type { Locator, Page } from '@playwright/test';

import { ROUTES } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';
import type { ScenarioId } from '../../shared/config/constants';

/**
 * Authenticated dashboard / My Workspace surface (Sprint 03).
 * No form-field or advisor-chat interactions.
 */
export class DashboardPage extends BasePage {
  readonly root: Locator;
  readonly hero: Locator;
  readonly heroTitle: Locator;
  readonly advisorCard: Locator;
  readonly openAdvisorButton: Locator;
  readonly workflowsSection: Locator;
  readonly scenarioCards: Locator;
  readonly myWorkspace: Locator;
  readonly applicationsPanel: Locator;
  readonly draftsPanel: Locator;
  readonly statsPanel: Locator;
  readonly activityPanel: Locator;
  readonly recommendationsPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-dashboard, .dashboard').first();
    this.hero = page.locator('.dashboard-hero');
    this.heroTitle = page.locator('.dashboard-hero-title');
    this.advisorCard = page.locator('.advisor-feature-card');
    this.openAdvisorButton = this.advisorCard.getByRole('button', {
      name: /Open Advisor/i,
    });
    this.workflowsSection = page.locator('#workflows');
    this.scenarioCards = page.locator('.scenario-card');
    this.myWorkspace = page.locator('#workspace');
    this.applicationsPanel = page.locator('#applications');
    this.draftsPanel = page
      .locator('.my-workspace-panel')
      .filter({ has: page.getByRole('heading', { name: /Continue Drafts/i }) });
    this.statsPanel = page
      .locator('.my-workspace-panel')
      .filter({
        has: page.getByRole('heading', { name: /Application Statistics/i }),
      });
    this.activityPanel = page
      .locator('.my-workspace-panel')
      .filter({ has: page.getByRole('heading', { name: /Recent Activity/i }) });
    this.recommendationsPanel = page.locator('.my-workspace-panel-wide');
  }

  override async expectReady(): Promise<void> {
    await super.expectReady();
    await this.hero.waitFor({ state: 'visible' });
    await this.myWorkspace.waitFor({ state: 'visible' });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.dashboard);
  }

  scenarioCard(title: string | RegExp): Locator {
    return this.scenarioCards.filter({
      has: this.page.getByRole('heading', { name: title }),
    });
  }

  async openCatalogForm(title: string | RegExp): Promise<void> {
    await this.scenarioCard(title)
      .getByRole('button', { name: /Open Form/i })
      .click();
  }

  async openAdvisor(): Promise<void> {
    await this.openAdvisorButton.click();
  }

  applicationRow(applicationId: string): Locator {
    return this.applicationsPanel.locator('li').filter({ hasText: applicationId });
  }

  async openApplication(applicationId: string): Promise<void> {
    await this.applicationRow(applicationId)
      .getByRole('button', { name: /Quick View/i })
      .click();
  }

  draftRow(formTitle: string | RegExp): Locator {
    return this.draftsPanel.locator('li').filter({ hasText: formTitle });
  }

  async continueDraft(formTitle: string | RegExp): Promise<void> {
    await this.draftRow(formTitle)
      .getByRole('button', { name: /Continue Application/i })
      .click();
  }

  recommendationCard(title: string | RegExp): Locator {
    return this.recommendationsPanel
      .locator('.my-workspace-rec-card')
      .filter({ hasText: title });
  }

  async openRecommendation(title: string | RegExp): Promise<void> {
    await this.recommendationCard(title)
      .getByRole('button', { name: /Continue/i })
      .click();
  }

  statValue(label: string): Locator {
    return this.statsPanel
      .locator('.my-workspace-stats > div')
      .filter({
        has: this.page.locator('.my-workspace-stat-label', {
          hasText: new RegExp(`^${label}$`),
        }),
      })
      .locator('.my-workspace-stat-value');
  }

  emptyIn(panel: Locator): Locator {
    return panel.locator('.my-workspace-empty');
  }
}

export type { ScenarioId };
