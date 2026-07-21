import type { Locator, Page } from '@playwright/test';

import { dismissOverlays } from '../../shared/components/primeng';
import type { FormFillStep } from '../data/form.types';
import { DynamicForm } from './dynamic-form';

const REPEATER_KEY = 'jointApplicants';

/**
 * Joint Applicants repeater — add/remove/expand + nested field-key fills.
 * Nested ids: jointApplicants-{index}-{childKey}
 */
export class JointApplicantsRepeater {
  readonly form: DynamicForm;

  constructor(private readonly page: Page) {
    this.form = new DynamicForm(page);
  }

  get root(): Locator {
    return this.page.locator('.formflow-repeater[aria-label="Joint Applicants"]');
  }

  get addButton(): Locator {
    return this.page.getByRole('button', {
      name: /Add Another Applicant/i,
    });
  }

  get items(): Locator {
    return this.page.locator('.formflow-repeater-item');
  }

  item(index: number): Locator {
    return this.items.nth(index);
  }

  itemTitle(index: number): Locator {
    return this.item(index).locator('.formflow-repeater-item-title');
  }

  removeButton(index: number): Locator {
    return this.item(index).locator('button.formflow-repeater-remove, .formflow-repeater-remove button').first();
  }

  nestedKey(index: number, childKey: string): string {
    return `${REPEATER_KEY}-${index}-${childKey}`;
  }

  async count(): Promise<number> {
    return this.items.count();
  }

  async ensureExpanded(index: number): Promise<void> {
    const item = this.item(index);
    const toggle = item.locator('.formflow-repeater-item-toggle');
    await item.waitFor({ state: 'visible' });
    const expanded = await toggle.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await toggle.click();
    }
    await item.locator('.formflow-repeater-item-body-open').waitFor({
      state: 'visible',
      timeout: 10_000,
    });
  }

  async addApplicant(): Promise<void> {
    await dismissOverlays(this.page);
    const before = await this.count();
    await this.addButton.scrollIntoViewIfNeeded();
    await this.addButton.click({ force: true });
    await this.page.waitForFunction(
      (prev) =>
        document.querySelectorAll('.formflow-repeater-item').length === prev + 1,
      before,
      { timeout: 15_000 },
    );
    await this.item(before).waitFor({ state: 'visible', timeout: 15_000 });
    await this.ensureExpanded(before);
  }

  async removeApplicant(index: number): Promise<void> {
    await dismissOverlays(this.page);
    const before = await this.count();
    // Remove control lives in the row toolbar (visible when canRemove).
    await this.removeButton(index).scrollIntoViewIfNeeded();
    await this.removeButton(index).click({ force: true });
    await this.page.waitForFunction(
      (prev) =>
        document.querySelectorAll('.formflow-repeater-item').length === prev - 1,
      before,
      { timeout: 10_000 },
    );
  }

  async fillRow(index: number, steps: FormFillStep[]): Promise<void> {
    await this.ensureExpanded(index);
    for (const step of steps) {
      const nested = {
        ...step,
        key: this.nestedKey(index, step.key),
      } as FormFillStep;
      await this.form.applyStep(nested);
      await dismissOverlays(this.page);
      if (step.key === 'relation') {
        await this.ensureExpanded(index);
      }
    }
  }

  async uploadProof(
    index: number,
    file:
      | string
      | { name: string; mimeType: string; buffer: Buffer } = {
        name: 'relationship-proof.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          'base64',
        ),
      },
  ): Promise<void> {
    await this.ensureExpanded(index);
    const key = this.nestedKey(index, 'relationshipProof');
    await this.page.locator(`input#${key}[type="file"]`).setInputFiles(file);
  }

  async setRelation(index: number, label: string): Promise<void> {
    await this.fillRow(index, [
      {
        key: 'relation',
        type: 'dropdown',
        value: label.toLowerCase(),
        label,
      },
    ]);
  }
}

export { REPEATER_KEY };
