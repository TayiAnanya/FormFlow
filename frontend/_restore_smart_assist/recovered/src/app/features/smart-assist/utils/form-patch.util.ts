import { FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { MappedFormValues, PatchFormOptions } from '../models/document-extraction.model';

/** Returns whether a control already holds a meaningful user-entered value. */
export function hasExistingUserValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return true;
}

/** Coerces an extracted value to the field type expected by the reactive control. */
export function coerceValueForField(field: Field, value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return String(value);
    case 'dropdown': {
      const stringValue = String(value);
      const option = field.options?.find(
        (entry) => entry.value === stringValue || entry.label.toLowerCase() === stringValue.toLowerCase(),
      );
      return option?.value ?? stringValue;
    }
    case 'multiselect':
      return Array.isArray(value) ? value.map((entry) => String(entry)) : [String(value)];
    case 'checkbox':
      if (typeof value === 'boolean') {
        return value;
      }
      return String(value).toLowerCase() === 'true' || String(value) === '1';
    default:
      return value;
  }
}

/**
 * Builds a patch object for `FormGroup.patchValue()` using schema rules.
 * Skips hidden, readonly, disabled, and already-filled fields unless overwrite is requested.
 */
export function buildPatchValues(
  schema: FormSchema,
  form: FormGroup,
  mappedValues: MappedFormValues,
  options: PatchFormOptions = {},
): MappedFormValues {
  const overwriteExisting = options.overwriteExisting === true;
  const patch: MappedFormValues = {};

  for (const field of schema.fields) {
    if (!(field.key in mappedValues)) {
      continue;
    }

    if (field.hidden === true || field.readonly === true) {
      continue;
    }

    const control = form.get(field.key);
    if (!control || control.disabled) {
      continue;
    }

    if (!overwriteExisting && hasExistingUserValue(control.value)) {
      continue;
    }

    patch[field.key] = coerceValueForField(field, mappedValues[field.key]);
  }

  return patch;
}

/** Applies mapped values and returns what was patched versus skipped. */
export function applyMappedValues(
  schema: FormSchema,
  form: FormGroup,
  mappedValues: MappedFormValues,
  options: PatchFormOptions = {},
): { patched: MappedFormValues; skipped: string[] } {
  const patch = buildPatchValues(schema, form, mappedValues, options);
  const skipped = Object.keys(mappedValues).filter((key) => !(key in patch));

  if (Object.keys(patch).length > 0) {
    form.patchValue(patch);
  }

  return { patched: patch, skipped };
}
