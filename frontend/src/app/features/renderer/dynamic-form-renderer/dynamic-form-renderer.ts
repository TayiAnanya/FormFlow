import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Button } from 'primeng/button';

import { FormSchema } from '../../../models/form-schema.model';
import { Field } from '../../../models/field.model';
import { Submission } from '../../../models/submission.model';
import { SchemaLoaderService } from '../../../services/schema-loader.service';
import {
  MappedFormValues,
  PatchFormOptions,
} from '../../smart-assist/models/document-extraction.model';
import { applyMappedValues } from '../../smart-assist/utils/form-patch.util';

import { SchemaFieldHost } from '../schema-field-host/schema-field-host';
import { initializeFormState } from '../utils/form-state.lifecycle';
import { fieldControlId, resolveFieldAutocomplete } from '../utils/field-accessibility.util';
import {
  isFieldVisible as evaluateFieldVisible,
  markApplicableFieldsTouched,
  refreshApplicableValidationState,
  syncFieldVisibility,
} from '../utils/field-visibility.util';
import { buildSubmission } from '../utils/submission.factory';
import {
  activeValidationMessage,
  shouldDisplayFieldError,
} from '../utils/validation-message.util';

@Component({
  selector: 'app-dynamic-form-renderer',
  standalone: true,
  imports: [ReactiveFormsModule, Button, SchemaFieldHost],
  templateUrl: './dynamic-form-renderer.html',
  styleUrl: './dynamic-form-renderer.css',
})
export class DynamicFormRenderer implements OnChanges, OnDestroy {
  private readonly schemaLoader = inject(SchemaLoaderService);

  private formValueSubscription?: Subscription;

  @Input({ required: true }) schema!: FormSchema;

  /** Optional: when true, the submit control is hidden (read-only review). */
  @Input() readOnly = false;

  /** Fires after a successful schema-driven submission (additive host hook). */
  @Output() readonly formSubmitted = new EventEmitter<Submission>();

  /** Fires on value changes so hosts can autosave drafts. */
  @Output() readonly formValuesChanged = new EventEmitter<Record<string, unknown>>();

  protected form: FormGroup = new FormGroup({});

  protected submitted = false;

  protected submission: Submission | null = null;

  protected copyFeedback = false;

  ngOnChanges(changes: SimpleChanges): void {
    const schemaChange = changes['schema'];
    if (!schemaChange?.currentValue) {
      return;
    }

    const schema = schemaChange.currentValue as FormSchema;
    const previousSchema = schemaChange.previousValue as FormSchema | undefined;

    if (!schemaChange.firstChange && previousSchema?.id === schema.id) {
      return;
    }

    this.resetFormState(schema);
  }

  /**
   * Applies schema-aware extracted values to the reactive form.
   * Runs two passes so controlling fields (e.g. supportRequestType) can enable
   * conditional sections before dependent values are applied.
   * Optional Smart Assist / Voice Assist entry point — does not alter manual submit.
   */
  patchFormValues(
    values: MappedFormValues,
    options: PatchFormOptions = {},
  ): { patched: MappedFormValues; skipped: string[] } {
    const first = applyMappedValues(this.schema, this.form, values, options);
    this.syncFieldVisibilityState();

    const second = applyMappedValues(this.schema, this.form, values, options);
    this.syncFieldVisibilityState();

    const patched: MappedFormValues = { ...first.patched, ...second.patched };
    const skipped = Object.keys(values).filter((key) => !(key in patched));
    return { patched, skipped };
  }

  /** Returns current raw form values for optional Smart Assist conflict detection. */
  getFormValues(): Record<string, unknown> {
    return this.form.getRawValue();
  }

  /** Discards runtime state and initialises a clean FormState for the active schema. */
  private resetFormState(schema: FormSchema): void {
    this.submitted = false;
    this.submission = null;
    this.copyFeedback = false;
    this.formValueSubscription?.unsubscribe();
    this.form = initializeFormState(schema);
    this.syncFieldVisibilityState();
    this.watchFormValidity();
  }

  /** Keeps control disabled state aligned with `visibleWhen` and clears errors on hidden fields. */
  private syncFieldVisibilityState(): void {
    syncFieldVisibility(this.schema, this.form);
  }

  protected onSubmit(): void {
    if (this.readOnly) {
      return;
    }

    this.submitted = true;
    this.syncDateFieldsFromDom();
    refreshApplicableValidationState(this.schema, this.form);
    markApplicableFieldsTouched(this.schema, this.form);

    if (this.form.invalid) {
      this.submission = null;
      return;
    }

    this.submission = buildSubmission(this.schema, this.form);
    this.formSubmitted.emit(this.submission);
  }

  private watchFormValidity(): void {
    this.formValueSubscription?.unsubscribe();
    this.formValueSubscription = this.form.valueChanges.subscribe(() => {
      this.syncFieldVisibilityState();
      this.formValuesChanged.emit(this.form.getRawValue());

      if (this.submission !== null && this.form.invalid) {
        this.submission = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.formValueSubscription?.unsubscribe();
  }

  /** Reads visible date input text when PrimeNG has not propagated to the FormControl. */
  private syncDateFieldsFromDom(): void {
    this.syncDateFieldsInGroup(this.schema.fields, this.form, '');
  }

  private syncDateFieldsInGroup(fields: Field[], group: FormGroup, idPrefix: string): void {
    for (const field of fields) {
      if (field.type === 'repeater') {
        const control = group.get(field.key);
        if (!(control instanceof FormArray)) {
          continue;
        }

        for (let index = 0; index < control.length; index += 1) {
          const row = control.at(index);
          if (row instanceof FormGroup) {
            const rowPrefix = idPrefix
              ? `${idPrefix}-${field.key}-${index}`
              : `${field.key}-${index}`;
            this.syncDateFieldsInGroup(field.fields ?? [], row, rowPrefix);
          }
        }
        continue;
      }

      if (field.type !== 'date' || !evaluateFieldVisible(field, group)) {
        continue;
      }

      const controlId = idPrefix ? `${idPrefix}-${fieldControlId(field)}` : fieldControlId(field);
      const input = document.getElementById(controlId) as HTMLInputElement | null;
      if (!input) {
        continue;
      }

      const fieldControl = group.get(field.key);
      if (!fieldControl || fieldControl.disabled) {
        continue;
      }

      const value = input.value.trim();
      if (fieldControl.value !== value) {
        fieldControl.setValue(value);
      }
    }
  }

  protected formattedSubmission(): string {
    return this.submission ? JSON.stringify(this.submission, null, 2) : '';
  }

  protected shouldShowFieldError(field: Field): boolean {
    if (!this.isFieldVisible(field)) {
      return false;
    }

    const control = this.form.get(field.key);
    return shouldDisplayFieldError(control, field, this.submitted);
  }

  protected fieldErrorMessage(field: Field): string | undefined {
    if (!this.isFieldVisible(field)) {
      return undefined;
    }

    const control = this.form.get(field.key);
    return activeValidationMessage(field, control, this.submitted);
  }

  protected submitLabel(): string {
    return this.schemaLoader.resolveSubmitLabel(this.schema);
  }

  /** Schema-driven: fields with `hidden: true` are omitted from the rendered form. */
  protected isFieldHidden(field: Field): boolean {
    return field.hidden === true;
  }

  /** Schema-driven: text and textarea fields with `readonly: true` cannot be edited. */
  protected isFieldReadonly(field: Field): boolean {
    return this.readOnly || field.readonly === true;
  }

  /** Schema-driven: supported controls with `disabled: true` cannot be interacted with. */
  protected isFieldDisabled(field: Field): boolean {
    return this.readOnly || field.disabled === true;
  }

  /** Schema-driven: fields with `visibleWhen` are shown only when the rule matches current form values. */
  protected isFieldVisible(field: Field): boolean {
    return evaluateFieldVisible(field, this.form);
  }

  protected fieldId(field: Field): string {
    return fieldControlId(field);
  }

  protected autocomplete(field: Field): string | undefined {
    return resolveFieldAutocomplete(field);
  }

  /** Presentation-only: show a section heading when the field starts a new section. */
  protected sectionHeading(field: Field, index: number): string | null {
    const section = field.section?.trim();
    if (!section) {
      return null;
    }

    if (index === 0) {
      return section;
    }

    const previous = this.schema.fields[index - 1]?.section?.trim();
    return previous === section ? null : section;
  }

  /** Copies formatted submission JSON to the clipboard (UI only). */
  protected copySubmissionJson(): void {
    if (!this.submission) {
      return;
    }

    void navigator.clipboard.writeText(this.formattedSubmission()).then(() => {
      this.copyFeedback = true;
      window.setTimeout(() => {
        this.copyFeedback = false;
      }, 2000);
    });
  }

  /** Generates and downloads a schema-driven PDF of the current submission. */
  protected downloadSubmissionPdf(): void {
    if (!this.submission) {
      return;
    }

    const schema = this.schema;
    const submission = this.submission;

    void import('../utils/submission-pdf.generator').then(({ downloadSubmissionPdf }) => {
      downloadSubmissionPdf(schema, submission);
    });
  }
}
