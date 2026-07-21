import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Field } from '../../../models/field.model';

/** Parses an ISO date string (yyyy-MM-dd) into a local calendar date. */
function parseIsoDateString(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

/** Returns age in full years relative to a reference calendar date. */
function calculateAgeInYears(birthDate: Date, referenceDate: Date): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function startOfToday(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/** Rejects dates after today when `allowFutureDates` is false. */
function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyValue(control.value)) {
      return null;
    }

    const date = parseIsoDateString(String(control.value));

    if (!date) {
      return null;
    }

    return date.getTime() > startOfToday().getTime() ? { futureDate: true } : null;
  };
}

/** Rejects dates where the calculated age is below the configured minimum. */
function minimumAgeValidator(minimumAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyValue(control.value)) {
      return null;
    }

    const date = parseIsoDateString(String(control.value));

    if (!date) {
      return null;
    }

    const age = calculateAgeInYears(date, startOfToday());

    return age < minimumAge ? { minimumAge: true } : null;
  };
}

/** Rejects dates where the calculated age exceeds the configured maximum. */
function maximumAgeValidator(maximumAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyValue(control.value)) {
      return null;
    }

    const date = parseIsoDateString(String(control.value));

    if (!date) {
      return null;
    }

    const age = calculateAgeInYears(date, startOfToday());

    return age > maximumAge ? { maximumAge: true } : null;
  };
}

/** Applies schema pattern only when a non-empty value is present. */
function schemaPatternValidator(patternSource: string): ValidatorFn {
  const expression = new RegExp(patternSource);

  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyValue(control.value)) {
      return null;
    }

    return expression.test(String(control.value)) ? null : { pattern: true };
  };
}

/** Applies schema min only when a numeric value is present. */
function schemaMinValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyValue(control.value)) {
      return null;
    }

    const numericValue = Number(String(control.value));

    if (Number.isNaN(numericValue)) {
      return null;
    }

    return numericValue < min ? { min: { min, actual: numericValue } } : null;
  };
}

/** Applies schema max only when a numeric value is present. */
function schemaMaxValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyValue(control.value)) {
      return null;
    }

    const numericValue = Number(String(control.value));

    if (Number.isNaN(numericValue)) {
      return null;
    }

    return numericValue > max ? { max: { max, actual: numericValue } } : null;
  };
}

/** Ensures at least one value is selected for required multiselect fields. */
const nonEmptyArrayRequiredValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (Array.isArray(value) && value.length > 0) {
    return null;
  }

  return { required: true };
};

/** Ensures a file metadata object is present for required file fields. */
const fileRequiredValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (value && typeof value === 'object' && 'name' in value && Boolean((value as { name: string }).name)) {
    return null;
  }

  return { required: true };
};

/** FormArray must contain at least `minItems` rows. */
export function minItemsValidator(minItems: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    return control.length < minItems ? { minItems: { requiredLength: minItems, actualLength: control.length } } : null;
  };
}

/** FormArray must not exceed `maxItems` rows. */
export function maxItemsValidator(maxItems: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    return control.length > maxItems ? { maxItems: { requiredLength: maxItems, actualLength: control.length } } : null;
  };
}

/**
 * Builds required validators from schema configuration and field type.
 */
export function buildRequiredValidators(field: Field): ValidatorFn[] {
  if (!field.validation?.required) {
    return [];
  }

  switch (field.type) {
    case 'checkbox':
      return [Validators.requiredTrue];
    case 'multiselect':
      return [nonEmptyArrayRequiredValidator];
    case 'file':
      return [fileRequiredValidator];
    case 'text':
    case 'textarea':
    case 'date':
    case 'dropdown':
      return [Validators.required];
    default:
      return [];
  }
}

/**
 * Builds pattern validators from schema configuration for applicable field types.
 */
export function buildPatternValidators(field: Field): ValidatorFn[] {
  const pattern = field.validation?.pattern;

  if (!pattern || (field.type !== 'text' && field.type !== 'textarea')) {
    return [];
  }

  return [schemaPatternValidator(pattern)];
}

/** Builds min/max validators for text and textarea fields. */
export function buildRangeValidators(field: Field): ValidatorFn[] {
  const validation = field.validation;

  if (!validation || (field.type !== 'text' && field.type !== 'textarea')) {
    return [];
  }

  const validators: ValidatorFn[] = [];

  if (validation.min != null) {
    validators.push(schemaMinValidator(validation.min));
  }

  if (validation.max != null) {
    validators.push(schemaMaxValidator(validation.max));
  }

  return validators;
}

/** Builds minLength/maxLength validators for text and textarea fields. */
export function buildLengthValidators(field: Field): ValidatorFn[] {
  const validation = field.validation;

  if (!validation || (field.type !== 'text' && field.type !== 'textarea')) {
    return [];
  }

  const validators: ValidatorFn[] = [];

  if (validation.minLength != null) {
    validators.push(Validators.minLength(validation.minLength));
  }

  if (validation.maxLength != null) {
    validators.push(Validators.maxLength(validation.maxLength));
  }

  return validators;
}

/**
 * Builds date validators from schema configuration for date fields.
 */
export function buildDateValidators(field: Field): ValidatorFn[] {
  if (field.type !== 'date' || !field.validation) {
    return [];
  }

  const validators: ValidatorFn[] = [];

  if (field.validation.allowFutureDates === false) {
    validators.push(futureDateValidator());
  }

  if (field.validation.minimumAge != null) {
    validators.push(minimumAgeValidator(field.validation.minimumAge));
  }

  if (field.validation.maximumAge != null) {
    validators.push(maximumAgeValidator(field.validation.maximumAge));
  }

  return validators;
}

/** Builds FormArray-level min/max item validators for repeater fields. */
export function buildRepeaterValidators(field: Field): ValidatorFn[] {
  if (field.type !== 'repeater') {
    return [];
  }

  const validators: ValidatorFn[] = [];
  const minItems = field.minItems ?? 0;

  if (minItems > 0) {
    validators.push(minItemsValidator(minItems));
  }

  if (field.maxItems != null) {
    validators.push(maxItemsValidator(field.maxItems));
  }

  return validators;
}

/** Builds all schema-driven validators for a single leaf field. */
export function buildFieldValidators(field: Field): ValidatorFn[] {
  if (field.readonly === true || field.type === 'repeater') {
    return [];
  }

  return [
    ...buildRequiredValidators(field),
    ...buildDateValidators(field),
    ...buildRangeValidators(field),
    ...buildLengthValidators(field),
    ...buildPatternValidators(field),
  ];
}
