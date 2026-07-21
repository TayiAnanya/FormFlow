import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { Field } from '../../../models/field.model';
import { FileSubmissionValue } from '../../../models/submission.model';
import { fieldControlId, resolveFieldAutocomplete } from '../utils/field-accessibility.util';
import {
  addRepeaterItem,
  removeRepeaterItem,
  resolveRepeaterItemLabel,
} from '../utils/form-model.factory';
import { isFieldVisible as evaluateFieldVisible } from '../utils/field-visibility.util';
import {
  activeValidationMessage,
  shouldDisplayFieldError,
} from '../utils/validation-message.util';

/**
 * Schema-driven field renderer that recursively hosts nested repeater rows.
 * Operates against a parent FormGroup (root or a single repeater row).
 */
@Component({
  selector: 'app-schema-field-host',
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
    SchemaFieldHost,
  ],
  templateUrl: './schema-field-host.html',
  styleUrl: './schema-field-host.css',
})
export class SchemaFieldHost {
  @Input({ required: true }) field!: Field;
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() submitted = false;
  /** Prefix for nested control ids to keep them unique across repeater rows. */
  @Input() idPrefix = '';

  /** UI-only expand state for repeater applicant cards. */
  private readonly expandedRepeaterRows = new Set<string>();

  protected isFieldHidden(field: Field): boolean {
    return field.hidden === true;
  }

  protected isFieldReadonly(field: Field): boolean {
    return field.readonly === true;
  }

  protected isFieldDisabled(field: Field): boolean {
    return field.disabled === true;
  }

  protected isFieldVisible(field: Field): boolean {
    return evaluateFieldVisible(field, this.formGroup);
  }

  protected fieldId(field: Field): string {
    const base = fieldControlId(field);
    return this.idPrefix ? `${this.idPrefix}-${base}` : base;
  }

  protected autocomplete(field: Field): string | undefined {
    return resolveFieldAutocomplete(field);
  }

  protected shouldShowFieldError(field: Field): boolean {
    if (!this.isFieldVisible(field)) {
      return false;
    }

    const control = this.formGroup.get(field.key);
    return shouldDisplayFieldError(control, field, this.submitted);
  }

  protected fieldErrorMessage(field: Field): string | undefined {
    if (!this.isFieldVisible(field)) {
      return undefined;
    }

    const control = this.formGroup.get(field.key);
    return activeValidationMessage(field, control, this.submitted);
  }

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
      case 'file':
        return 'pi pi-upload';
      case 'repeater':
        return 'pi pi-users';
      default:
        return field.key === 'email' ? 'pi pi-envelope' : 'pi pi-user';
    }
  }

  protected asFormArray(field: Field): FormArray {
    return this.formGroup.get(field.key) as FormArray;
  }

  protected rowGroup(field: Field, index: number): FormGroup {
    return this.asFormArray(field).at(index) as FormGroup;
  }

  protected itemLabel(field: Field, index: number): string {
    return resolveRepeaterItemLabel(field, index);
  }

  protected canAddItem(field: Field): boolean {
    const array = this.asFormArray(field);
    if (!array) {
      return false;
    }
    return field.maxItems == null || array.length < field.maxItems;
  }

  protected canRemoveItem(field: Field): boolean {
    const array = this.asFormArray(field);
    if (!array) {
      return false;
    }
    const minItems = Math.max(0, field.minItems ?? 0);
    return array.length > minItems;
  }

  protected onAddItem(field: Field): void {
    addRepeaterItem(this.asFormArray(field), field);
    const index = this.asFormArray(field).length - 1;
    this.expandedRepeaterRows.add(this.rowExpandKey(field, index));
  }

  protected onRemoveItem(field: Field, index: number): void {
    removeRepeaterItem(this.asFormArray(field), field, index);
    this.expandedRepeaterRows.delete(this.rowExpandKey(field, index));
  }

  protected isRowExpanded(field: Field, index: number): boolean {
    return this.expandedRepeaterRows.has(this.rowExpandKey(field, index));
  }

  protected toggleRowExpanded(field: Field, index: number): void {
    const key = this.rowExpandKey(field, index);
    if (this.expandedRepeaterRows.has(key)) {
      this.expandedRepeaterRows.delete(key);
    } else {
      this.expandedRepeaterRows.add(key);
    }
  }

  protected rowSummary(field: Field, index: number): string {
    const group = this.rowGroup(field, index);
    const candidates = ['fullName', 'applicantName', 'customerName', 'email'];
    for (const key of candidates) {
      const value = group.get(key)?.value;
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return this.itemLabel(field, index);
  }

  private rowExpandKey(field: Field, index: number): string {
    return `${this.rowIdPrefix(field, index)}`;
  }

  protected onFileSelected(field: Field, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const control = this.formGroup.get(field.key);
    if (!control || control.disabled) {
      return;
    }

    if (!file) {
      control.setValue(null);
      return;
    }

    const metadata: FileSubmissionValue = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    control.setValue(metadata);
    control.markAsDirty();
    control.markAsTouched();
  }

  protected clearFile(field: Field, input: HTMLInputElement): void {
    const control = this.formGroup.get(field.key);
    if (!control || control.disabled) {
      return;
    }

    control.setValue(null);
    input.value = '';
    control.markAsDirty();
    control.markAsTouched();
  }

  protected fileDisplayName(field: Field): string {
    const value = this.formGroup.get(field.key)?.value as FileSubmissionValue | null;
    return value?.name ?? '';
  }

  protected onDatePickerInput(field: Field, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.patchDateControlValue(field, value);
  }

  protected onDatePickerSelect(field: Field, date: Date): void {
    this.patchDateControlValue(field, date ? this.toIsoDateString(date) : '');
  }

  protected onDatePickerBlur(field: Field, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.patchDateControlValue(field, value);
  }

  private patchDateControlValue(field: Field, value: string): void {
    const control = this.formGroup.get(field.key);
    if (!control || control.disabled) {
      return;
    }

    if (control.value !== value) {
      control.setValue(value);
    }
  }

  private toIsoDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected rowIdPrefix(field: Field, index: number): string {
    const base = this.idPrefix ? `${this.idPrefix}-${field.key}` : field.key;
    return `${base}-${index}`;
  }
}
