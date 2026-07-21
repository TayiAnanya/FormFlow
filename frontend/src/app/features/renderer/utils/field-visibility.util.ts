import { FormArray, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { VisibilityRule } from '../../../models/visibility-rule.model';

/** Evaluates a schema visibility rule against the current source field value. */
export function evaluateVisibilityRule(rule: VisibilityRule, sourceValue: unknown): boolean {
  switch (rule.operator) {
    case 'equals':
      return sourceValue === rule.value;
    default:
      return false;
  }
}

/** Returns whether a field should be shown based on its `visibleWhen` rule and current form values. */
export function isFieldVisible(field: Field, form: FormGroup): boolean {
  if (!field.visibleWhen) {
    return true;
  }

  const sourceValue = form.get(field.visibleWhen.field)?.value;
  return evaluateVisibilityRule(field.visibleWhen, sourceValue);
}

/**
 * Returns whether a field should appear in submission output.
 * Excludes `hidden` fields and fields whose `visibleWhen` rule is not satisfied.
 */
export function shouldIncludeFieldInSubmission(field: Field, form: FormGroup): boolean {
  if (field.hidden === true) {
    return false;
  }

  return isFieldVisible(field, form);
}

/** Syncs enable/disable for fields belonging to a single FormGroup (root or repeater row). */
export function syncFieldsVisibility(fields: Field[], form: FormGroup): void {
  for (const field of fields) {
    const control = form.get(field.key);
    if (!control) {
      continue;
    }

    const visible = shouldIncludeFieldInSubmission(field, form);

    if (!visible) {
      if (control.enabled) {
        control.disable({ emitEvent: false });
      }
      control.markAsUntouched();
      control.setErrors(null);
      continue;
    }

    if (field.disabled === true) {
      if (control.enabled) {
        control.disable({ emitEvent: false });
      }
      continue;
    }

    if (control.disabled) {
      control.enable({ emitEvent: false });
      control.updateValueAndValidity({ emitEvent: false });
    }

    if (field.type === 'repeater' && control instanceof FormArray) {
      for (let index = 0; index < control.length; index += 1) {
        const row = control.at(index);
        if (row instanceof FormGroup) {
          syncFieldsVisibility(field.fields ?? [], row);
        }
      }
    }
  }
}

/**
 * Aligns FormControl enabled/disabled state with visibility and schema `disabled`.
 * Recurses into repeater FormArray rows so nested visibleWhen is row-scoped.
 */
export function syncFieldVisibility(schema: FormSchema, form: FormGroup): void {
  syncFieldsVisibility(schema.fields, form);
}

function forEachApplicableControl(
  fields: Field[],
  form: FormGroup,
  visit: (field: Field, control: NonNullable<ReturnType<FormGroup['get']>>) => void,
): void {
  for (const field of fields) {
    const control = form.get(field.key);
    if (!control || control.disabled) {
      continue;
    }

    if (field.type === 'repeater' && control instanceof FormArray) {
      visit(field, control);
      for (let index = 0; index < control.length; index += 1) {
        const row = control.at(index);
        if (row instanceof FormGroup) {
          forEachApplicableControl(field.fields ?? [], row, visit);
        }
      }
      continue;
    }

    visit(field, control);
  }
}

/** Re-syncs visibility then re-validates only enabled, applicable controls. */
export function refreshApplicableValidationState(schema: FormSchema, form: FormGroup): void {
  syncFieldVisibility(schema, form);

  forEachApplicableControl(schema.fields, form, (_field, control) => {
    control.updateValueAndValidity({ emitEvent: false });
  });
}

/** Marks visible, enabled fields as touched so validation messages appear after submit. */
export function markApplicableFieldsTouched(schema: FormSchema, form: FormGroup): void {
  const visit = (fields: Field[], group: FormGroup): void => {
    for (const field of fields) {
      if (field.hidden === true) {
        continue;
      }

      const control = group.get(field.key);
      if (!control || control.disabled) {
        continue;
      }

      if (!isFieldVisible(field, group)) {
        continue;
      }

      if (field.type === 'repeater' && control instanceof FormArray) {
        control.markAsTouched();
        for (let index = 0; index < control.length; index += 1) {
          const row = control.at(index);
          if (row instanceof FormGroup) {
            visit(field.fields ?? [], row);
          }
        }
        continue;
      }

      control.markAsTouched();
    }
  };

  visit(schema.fields, form);
}
