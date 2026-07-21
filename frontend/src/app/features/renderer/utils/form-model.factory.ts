import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';

import { crossApplicantUniquenessValidator } from './cross-applicant.validator';
import { resolveFieldDefaultValue } from './field-default.resolver';
import { buildFieldValidators, buildRepeaterValidators } from './field-validators.factory';

/** Builds a FormGroup from an ordered list of field definitions (recursive). */
export function buildGroupFromFields(fields: Field[]): FormGroup {
  const controls: Record<string, AbstractControl> = {};

  for (const field of fields) {
    controls[field.key] = buildControlForField(field);
  }

  return new FormGroup(controls);
}

/** Builds the appropriate AbstractControl for a single schema field. */
export function buildControlForField(field: Field): AbstractControl {
  if (field.type === 'repeater') {
    return buildRepeaterArray(field);
  }

  return new FormControl(
    {
      value: resolveFieldDefaultValue(field),
      disabled: field.disabled === true,
    },
    {
      validators: buildFieldValidators(field),
    },
  );
}

/** Creates an empty FormGroup for one repeater row from the repeater's nested fields. */
export function createRepeaterItemGroup(field: Field): FormGroup {
  return buildGroupFromFields(field.fields ?? []);
}

/** Builds a FormArray of FormGroups for a repeater field, seeded to minItems. */
export function buildRepeaterArray(field: Field): FormArray {
  const minItems = Math.max(0, field.minItems ?? 0);
  const rows: FormGroup[] = [];

  for (let index = 0; index < minItems; index += 1) {
    rows.push(createRepeaterItemGroup(field));
  }

  return new FormArray(rows, { validators: buildRepeaterValidators(field) });
}

/**
 * Appends a new row to a repeater FormArray when under maxItems.
 * @returns true when a row was added
 */
export function addRepeaterItem(array: FormArray, field: Field): boolean {
  if (field.maxItems != null && array.length >= field.maxItems) {
    return false;
  }

  array.push(createRepeaterItemGroup(field));
  array.updateValueAndValidity({ emitEvent: false });
  array.parent?.updateValueAndValidity({ emitEvent: true });
  return true;
}

/**
 * Removes a row from a repeater FormArray when above minItems.
 * @returns true when a row was removed
 */
export function removeRepeaterItem(array: FormArray, field: Field, index: number): boolean {
  const minItems = Math.max(0, field.minItems ?? 0);

  if (index < 0 || index >= array.length) {
    return false;
  }

  if (array.length <= minItems) {
    return false;
  }

  array.removeAt(index);
  array.updateValueAndValidity({ emitEvent: false });
  array.parent?.updateValueAndValidity({ emitEvent: true });
  return true;
}

/** Resolves a display label for a repeater row (supports `{{index}}`). */
export function resolveRepeaterItemLabel(field: Field, index: number): string {
  const template = field.itemLabel?.trim() || 'Item {{index}}';
  return template.replace(/\{\{\s*index\s*\}\}/gi, String(index + 1));
}

/** Builds a programmatic Reactive Forms model from a FormSchema. */
export function buildFormGroup(schema: FormSchema): FormGroup {
  const group = buildGroupFromFields(schema.fields);

  if (schema.crossApplicantValidation) {
    group.setValidators(crossApplicantUniquenessValidator(schema.crossApplicantValidation));
    group.updateValueAndValidity({ emitEvent: false });
  }

  return group;
}
