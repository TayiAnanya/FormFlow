import type { Locator, Page } from '@playwright/test';

import { ROUTES, type ScenarioId } from '../../shared/config/constants';
import { BasePage } from '../../shared/pages/base.page';
import { DynamicForm } from '../components/dynamic-form';

/**
 * FormHost route chrome — schema load / error / host success.
 * Field interactions live on DynamicForm.
 */
export class FormHostPage extends BasePage {
  readonly form: DynamicForm;

  constructor(page: Page) {
    super(page);
    this.form = new DynamicForm(page);
  }

  get host(): Locator {
    return this.page.locator('app-form-host');
  }

  get title(): Locator {
    return this.page.locator('.form-host-header h1');
  }

  get schemaSuccessMessage(): Locator {
    return this.page.getByText(/Form schema loaded successfully for scenario/);
  }

  get schemaErrorHelper(): Locator {
    return this.page.getByText(
      'The form cannot be rendered until the schema configuration is corrected.',
    );
  }

  get catalogMissingMessage(): Locator {
    return this.page.getByText(/was not found in the scenario catalog/);
  }

  get bundledMissingMessage(): Locator {
    return this.page.getByText(/No bundled form schema was found for id/);
  }

  get blankSchemaMessage(): Locator {
    return this.page.getByText('No form schema identifier was provided.');
  }

  get returnToDashboard(): Locator {
    return this.page.getByText('Return to Dashboard', { exact: true });
  }

  get backToWorkspace(): Locator {
    return this.page.locator('.form-host-back-btn, a, button').filter({
      hasText: 'Back to My Workspace',
    }).first();
  }

  get applicationSavedBanner(): Locator {
    return this.page.getByText(/Application saved as /);
  }

  get viewApplication(): Locator {
    return this.page.getByText('View application', { exact: true });
  }

  async open(scenarioId: ScenarioId | string): Promise<void> {
    await this.goto(ROUTES.form(scenarioId));
  }

  override async expectReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.host.waitFor({ state: 'visible' });
  }

  async expectFormReady(): Promise<void> {
    await this.expectReady();
    await this.form.root.waitFor({ state: 'visible' });
  }
}
