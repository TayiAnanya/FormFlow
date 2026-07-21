import { AbstractControl, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';

import {
  CROSS_APPLICANT_ERROR_KEYS,
  crossApplicantErrorMessage,
} from './cross-applicant.validator';

type ValidationMessageResolver = {
  isConfigured: (field: Field) => boolean;
  hasError: (control: AbstractControl) => boolean;
  message: (field: Field, control: AbstractControl) => string | undefined;
};

function isFieldTouchedOrSubmitted(control: AbstractControl, submitted: boolean): boolean {
  return control.touched || submitted;
}

const VALIDATION_MESSAGE_RESOLVERS: ValidationMessageResolver[] = [
  {
    isConfigured: (field) => field.validation?.required === true,
    hasError: (control) => control.hasError('required'),
    message: (field) => field.validation?.messages?.required,
  },
  {
    isConfigured: () => true,
    hasError: (control) => CROSS_APPLICANT_ERROR_KEYS.some((key) => control.hasError(key)),
    message: (_field, control) => crossApplicantErrorMessage(control),
  },
  {
    isConfigured: (field) => field.validation?.allowFutureDates === false,
    hasError: (control) => control.hasError('futureDate'),
    message: (field) => field.validation?.messages?.futureDate,
  },
  {
    isConfigured: (field) => field.validation?.minimumAge != null,
    hasError: (control) => control.hasError('minimumAge'),
    message: (field) => field.validation?.messages?.minimumAge,
  },
  {
    isConfigured: (field) => field.validation?.maximumAge != null,
    hasError: (control) => control.hasError('maximumAge'),
    message: (field) => field.validation?.messages?.maximumAge,
  },
  {
    isConfigured: (field) => field.validation?.min != null,
    hasError: (control) => control.hasError('min'),
    message: (field) => field.validation?.messages?.min,
  },
  {
    isConfigured: (field) => field.validation?.max != null,
    hasError: (control) => control.hasError('max'),
    message: (field) => field.validation?.messages?.max,
  },
  {
    isConfigured: (field) => field.validation?.minLength != null,
    hasError: (control) => control.hasError('minlength'),
    message: (field) => field.validation?.messages?.minLength,
  },
  {
    isConfigured: (field) => field.validation?.maxLength != null,
    hasError: (control) => control.hasError('maxlength'),
    message: (field) => field.validation?.messages?.maxLength,
  },
  {
    isConfigured: (field) => Boolean(field.validation?.pattern),
    hasError: (control) => control.hasError('pattern'),
    message: (field) => field.validation?.messages?.pattern,
  },
];

/** Reads the schema-configured required message for a field. */
export function requiredValidationMessage(field: Field): string | undefined {
  return field.validation?.messages?.required;
}

/** Reads the schema-configured pattern message for a field. */
export function patternValidationMessage(field: Field): string | undefined {
  return field.validation?.messages?.pattern;
}

/** Whether a required validation error should be displayed for a control. */
export function shouldDisplayRequiredError(
  control: AbstractControl | null,
  field: Field,
  submitted: boolean,
): boolean {
  if (!control) {
    return false;
  }

  return shouldDisplayValidationError(control, field, submitted, 0);
}

/** Whether any validation error should be displayed for a control. */
export function shouldDisplayFieldError(
  control: AbstractControl | null,
  field: Field,
  submitted: boolean,
): boolean {
  if (!control) {
    return false;
  }

  return VALIDATION_MESSAGE_RESOLVERS.some((_resolver, index) =>
    shouldDisplayValidationError(control, field, submitted, index),
  );
}

/** Returns the active schema message for a field (highest priority only). */
export function activeValidationMessage(
  field: Field,
  control: AbstractControl | null,
  submitted: boolean,
): string | undefined {
  if (!control) {
    return undefined;
  }

  for (let index = 0; index < VALIDATION_MESSAGE_RESOLVERS.length; index++) {
    if (shouldDisplayValidationError(control, field, submitted, index)) {
      return VALIDATION_MESSAGE_RESOLVERS[index].message(field, control);
    }
  }

  return undefined;
}

function shouldDisplayValidationError(
  control: AbstractControl,
  field: Field,
  submitted: boolean,
  resolverIndex: number,
): boolean {
  if (field.readonly === true || control.disabled) {
    return false;
  }

  const resolver = VALIDATION_MESSAGE_RESOLVERS[resolverIndex];

  if (!resolver.isConfigured(field) || !resolver.hasError(control)) {
    return false;
  }

  if (!isFieldTouchedOrSubmitted(control, submitted)) {
    return false;
  }

  for (let index = 0; index < resolverIndex; index++) {
    const higherPriority = VALIDATION_MESSAGE_RESOLVERS[index];

    if (higherPriority.isConfigured(field) && higherPriority.hasError(control)) {
      return false;
    }
  }

  return true;
}

export function getFieldControl(form: FormGroup, field: Field): AbstractControl | null {
  return form.get(field.key);
}
