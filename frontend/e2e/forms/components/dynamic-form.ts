import type { Locator, Page } from '@playwright/test';

import {
  fieldRoot,
  fillDatePicker,
  selectDropdownOption,
  selectMultiselectOptions,
  setCheckbox,
} from '../../shared/components/primeng';
import type { FormFillStep } from '../data/form.types';

/**
 * Schema-driven field-key API — one component for all scenarios.
 * No per-schema field lists; no assertions.
 */
export class DynamicForm {
  constructor(private readonly page: Page) {}

  get root(): Locator {
    return this.page.locator('app-dynamic-form-renderer');
  }

  get form(): Locator {
    return this.page.locator('form.formflow-form');
  }

  get submitButton(): Locator {
    return this.page.locator('button.formflow-submit-btn, .formflow-submit-btn button').first();
  }

  get submissionSuccess(): Locator {
    return this.page.locator('.formflow-submission-success');
  }

  field(key: string): Locator {
    return this.page.locator(`#${key}`);
  }

  textControl(key: string): Locator {
    return this.page.locator(`input#${key}, textarea#${key}`);
  }

  fieldContainer(key: string): Locator {
    return fieldRoot(this.page, key);
  }

  fieldError(key: string): Locator {
    return this.page.locator(`#${key}-error`);
  }

  async fillSteps(steps: FormFillStep[]): Promise<void> {
    for (const step of steps) {
      await this.applyStep(step);
    }
  }

  async applyStep(step: FormFillStep): Promise<void> {
    switch (step.type) {
      case 'text':
        await this.textControl(step.key).fill(step.value);
        break;
      case 'textarea':
        await this.page.locator(`textarea#${step.key}`).fill(step.value);
        break;
      case 'date':
        await fillDatePicker(this.page, step.key, step.value);
        break;
      case 'dropdown':
        await selectDropdownOption(this.page, step.key, step.label);
        break;
      case 'multiselect':
        await selectMultiselectOptions(this.page, step.key, step.labels);
        break;
      case 'checkbox':
        await setCheckbox(this.page, step.key, step.value);
        break;
      default: {
        const _exhaustive: never = step;
        throw new Error(`Unsupported fill step: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }

  async submitByLabel(submitLabel: string): Promise<void> {
    const { dismissOverlays } = await import('../../shared/components/primeng');
    await dismissOverlays(this.page);
    const submit = this.page.getByRole('button', { name: submitLabel, exact: true });
    await submit.scrollIntoViewIfNeeded();
    await submit.click({ force: true });
  }

  async clearText(key: string): Promise<void> {
    const el = this.textControl(key);
    if ((await el.count()) === 0) return;
    await el.fill('');
    await el.blur();
  }

  /** Clear text-like keys that may be hydrated from customer profile. */
  async clearKeys(keys: string[]): Promise<void> {
    const textLike = keys.filter(
      (k) =>
        !k.toLowerCase().includes('accepted') &&
        !k.toLowerCase().includes('consent') &&
        k !== 'termsAccepted' &&
        k !== 'declarationAccepted' &&
        k !== 'consentToContact',
    );
    for (const key of textLike) {
      await this.clearText(key);
    }
  }

  async ensureUnchecked(key: string): Promise<void> {
    const { setCheckbox } = await import('../../shared/components/primeng');
    await setCheckbox(this.page, key, false);
  }
}
