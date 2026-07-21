import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { FormSchema } from '../../../models/form-schema.model';
import { Field } from '../../../models/field.model';
import { Submission } from '../../../models/submission.model';
import { SchemaLoaderService } from '../../../services/schema-loader.service';
import {
  MappedFormValues,
  PatchFormOptions,
} from '../../smart-assist/models/document-extraction.model';
import { applyMappedValues } from '../../smart-assist/utils/form-patch.util';

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
  imports: [
    ReactiveFormsModule,
    InputText,
    Textarea,
    DatePicker,
    Select,
    MultiSelect,
    Checkbox,
    Button,
  ],
  templateUrl: './dynamic-form-renderer.html',
  styleUrl: './dynamic-form-renderer.css',
})
export class DynamicFormRenderer implements OnChanges, OnDestroy {
  private readonly schemaLoader = inject(SchemaLoaderService);

  private formValueSubscription?: Subscription;

  @Input({ required: true }) schema!: FormSchema;

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
   * Optional Smart Assist entry point — does not alter manual submit or validation flow.
   */
  patchFormValues(
    values: MappedFormValues,
    options: PatchFormOptions = {},
  ): { patched: MappedFormValues; skipped: string[] } {
    const result = applyMappedValues(this.schema, this.form, values, options);
    this.syncFieldVisibilityState();
    return result;
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
    this.submitted = true;
    this.syncDateFieldsFromDom();
    refreshApplicableValidationState(this.schema, this.form);
    markApplicableFieldsTouched(this.schema, this.form);

    if (this.form.invalid) {
      this.submission = null;
      return;
    }

    this.submission = buildSubmission(this.schema, this.form);
  }

  private watchFormValidity(): void {
    this.formValueSubscription?.unsubscribe();
    this.formValueSubscription = this.form.valueChanges.subscribe(() => {
      this.syncFieldVisibilityState();

      if (this.submission !== null && this.form.invalid) {
        this.submission = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.formValueSubscription?.unsubscribe();
  }

  /** Keeps typed date text aligned with the reactive FormControl. */
  protected onDatePickerInput(field: Field, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.patchDateControlValue(field, value);
  }

  /** Keeps calendar selections aligned with the reactive FormControl. */
  protected onDatePickerSelect(field: Field, date: Date): void {
    this.patchDateControlValue(field, date ? this.toIsoDateString(date) : '');
  }

  /** Syncs manual entry, paste, and autofill on blur. */
  protected onDatePickerBlur(field: Field, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.patchDateControlValue(field, value);
  }

  private patchDateControlValue(field: Field, value: string): void {
    const control = this.form.get(field.key);
    if (!control || control.disabled) {
      return;
    }

    if (control.value !== value) {
      control.setValue(value);
    }
  }

  /** Reads visible date input text when PrimeNG has not propagated to the FormControl. */
  private syncDateFieldsFromDom(): void {
    for (const field of this.schema.fields) {
      if (field.type !== 'date' || !this.isFieldVisible(field)) {
        continue;
      }

      const input = document.getElementById(this.fieldId(field)) as HTMLInputElement | null;
      if (!input) {
        continue;
      }

      this.patchDateControlValue(field, input.value.trim());
    }
  }

  private toIsoDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    return field.readonly === true;
  }

  /** Schema-driven: supported controls with `disabled: true` cannot be interacted with. */
  protected isFieldDisabled(field: Field): boolean {
    return field.disabled === true;
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

  /** Presentation-only icon mapping by field type. */
  protected fieldIcon(field: Field): string {
    switch (field.type) {
      case 'date':
        return 'pi pi-calendar';
      case 'dropdown':
        return 'pi pi-list';
      case 'multiselect':
        return 'pi pi-th-large';
      case 'checkbox':
        return 'pi pi-check-square';
      case 'textarea':
        return 'pi pi-comment';
      default:
        return field.key === 'email' ? 'pi pi-envelope' : 'pi pi-user';
    }
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
