import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { CrossApplicantValidationConfig } from '../../../models/cross-applicant-validation.model';

/** Error keys applied to conflicting controls by the form-level validator. */
export const CROSS_APPLICANT_ERROR_KEYS = [
  'matchesPrimary',
  'duplicateJoint',
  'duplicateEmail',
  'duplicateMobile',
  'identityFallback',
] as const;

export type CrossApplicantErrorKey = (typeof CROSS_APPLICANT_ERROR_KEYS)[number];

interface ApplicantSnapshot {
  /** null = primary applicant at form root */
  rowIndex: number | null;
  group: FormGroup;
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  idType: string;
  idNumber: string;
}

function readString(group: FormGroup, key: string): string {
  const value = group.get(key)?.value;
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

function normalizeIdentity(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeMobile(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasPriorityIdentity(
  applicant: ApplicantSnapshot,
  priorityTypes: string[],
): boolean {
  if (!applicant.idType || !applicant.idNumber) {
    return false;
  }
  return priorityTypes.includes(applicant.idType);
}

function identityKey(
  applicant: ApplicantSnapshot,
  priorityTypes: string[],
): string | null {
  if (!hasPriorityIdentity(applicant, priorityTypes)) {
    return null;
  }
  return `${applicant.idType}:${normalizeIdentity(applicant.idNumber)}`;
}

function collectApplicants(
  form: FormGroup,
  config: CrossApplicantValidationConfig,
): ApplicantSnapshot[] {
  const applicants: ApplicantSnapshot[] = [
    {
      rowIndex: null,
      group: form,
      fullName: readString(form, config.fullNameKey),
      dateOfBirth: readString(form, config.dateOfBirthKey),
      email: readString(form, config.emailKey),
      mobile: readString(form, config.mobileKey),
      idType: readString(form, config.idTypeKey),
      idNumber: readString(form, config.idNumberKey),
    },
  ];

  const array = form.get(config.repeaterKey);
  if (!(array instanceof FormArray)) {
    return applicants;
  }

  for (let index = 0; index < array.length; index += 1) {
    const row = array.at(index);
    if (!(row instanceof FormGroup)) {
      continue;
    }

    applicants.push({
      rowIndex: index,
      group: row,
      fullName: readString(row, config.fullNameKey),
      dateOfBirth: readString(row, config.dateOfBirthKey),
      email: readString(row, config.emailKey),
      mobile: readString(row, config.mobileKey),
      idType: readString(row, config.idTypeKey),
      idNumber: readString(row, config.idNumberKey),
    });
  }

  return applicants;
}

function clearCrossApplicantError(control: AbstractControl | null): void {
  if (!control?.errors) {
    return;
  }

  const remaining: ValidationErrors = { ...control.errors };
  let changed = false;

  for (const key of CROSS_APPLICANT_ERROR_KEYS) {
    if (key in remaining) {
      delete remaining[key];
      changed = true;
    }
  }

  if (!changed) {
    return;
  }

  control.setErrors(Object.keys(remaining).length > 0 ? remaining : null);
}

function clearAllCrossApplicantErrors(
  form: FormGroup,
  config: CrossApplicantValidationConfig,
): void {
  const keys = [
    config.fullNameKey,
    config.dateOfBirthKey,
    config.emailKey,
    config.mobileKey,
    config.idTypeKey,
    config.idNumberKey,
  ];

  for (const key of keys) {
    clearCrossApplicantError(form.get(key));
  }

  const array = form.get(config.repeaterKey);
  if (!(array instanceof FormArray)) {
    return;
  }

  for (let index = 0; index < array.length; index += 1) {
    const row = array.at(index);
    if (!(row instanceof FormGroup)) {
      continue;
    }
    for (const key of keys) {
      clearCrossApplicantError(row.get(key));
    }
  }
}

function setCrossApplicantError(
  control: AbstractControl | null,
  errorKey: CrossApplicantErrorKey,
  message: string,
): void {
  if (!control || control.disabled) {
    return;
  }

  const next: ValidationErrors = {
    ...(control.errors ?? {}),
    [errorKey]: { message },
  };
  control.setErrors(next);
}

function sameIdentity(
  left: ApplicantSnapshot,
  right: ApplicantSnapshot,
  priorityTypes: string[],
): boolean {
  for (const type of priorityTypes) {
    if (left.idType !== type || right.idType !== type) {
      continue;
    }
    if (!left.idNumber || !right.idNumber) {
      continue;
    }
    if (normalizeIdentity(left.idNumber) === normalizeIdentity(right.idNumber)) {
      return true;
    }
  }
  return false;
}

function sameFallbackIdentity(left: ApplicantSnapshot, right: ApplicantSnapshot): boolean {
  if (!left.fullName || !left.dateOfBirth || !left.mobile) {
    return false;
  }
  if (!right.fullName || !right.dateOfBirth || !right.mobile) {
    return false;
  }

  return (
    normalizeName(left.fullName) === normalizeName(right.fullName) &&
    left.dateOfBirth === right.dateOfBirth &&
    normalizeMobile(left.mobile) === normalizeMobile(right.mobile)
  );
}

/**
 * Form-level validator: uniqueness across primary + joint applicants.
 * Applies error keys only on conflicting joint (and when relevant primary contact) controls.
 * Existing field validators are preserved.
 */
export function crossApplicantUniquenessValidator(
  config: CrossApplicantValidationConfig,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    clearAllCrossApplicantErrors(control, config);

    const applicants = collectApplicants(control, config);
    const primary = applicants[0];
    const joints = applicants.filter((entry) => entry.rowIndex !== null);

    let hasConflict = false;

    // 1 + 2: identity document uniqueness (Aadhaar → PAN → Passport)
    for (let i = 0; i < joints.length; i += 1) {
      const joint = joints[i];

      if (sameIdentity(primary, joint, config.identityTypePriority)) {
        setCrossApplicantError(
          joint.group.get(config.idNumberKey),
          'matchesPrimary',
          config.messages.matchesPrimary,
        );
        hasConflict = true;
        continue;
      }

      for (let j = i + 1; j < joints.length; j += 1) {
        const other = joints[j];
        if (!sameIdentity(joint, other, config.identityTypePriority)) {
          continue;
        }

        setCrossApplicantError(
          joint.group.get(config.idNumberKey),
          'duplicateJoint',
          config.messages.duplicateJoint,
        );
        setCrossApplicantError(
          other.group.get(config.idNumberKey),
          'duplicateJoint',
          config.messages.duplicateJoint,
        );
        hasConflict = true;
      }
    }

    // 3: unique emails — errors only on conflicting joint applicants
    const emailOwners = new Map<string, ApplicantSnapshot[]>();
    for (const applicant of applicants) {
      if (!applicant.email) {
        continue;
      }
      const key = normalizeEmail(applicant.email);
      const list = emailOwners.get(key) ?? [];
      list.push(applicant);
      emailOwners.set(key, list);
    }

    for (const owners of emailOwners.values()) {
      if (owners.length < 2) {
        continue;
      }
      for (const owner of owners) {
        if (owner.rowIndex === null) {
          continue;
        }
        setCrossApplicantError(
          owner.group.get(config.emailKey),
          'duplicateEmail',
          config.messages.duplicateEmail,
        );
        hasConflict = true;
      }
    }

    // 4: unique mobiles — errors only on conflicting joint applicants
    const mobileOwners = new Map<string, ApplicantSnapshot[]>();
    for (const applicant of applicants) {
      if (!applicant.mobile) {
        continue;
      }
      const key = normalizeMobile(applicant.mobile);
      if (!key) {
        continue;
      }
      const list = mobileOwners.get(key) ?? [];
      list.push(applicant);
      mobileOwners.set(key, list);
    }

    for (const owners of mobileOwners.values()) {
      if (owners.length < 2) {
        continue;
      }
      for (const owner of owners) {
        if (owner.rowIndex === null) {
          continue;
        }
        setCrossApplicantError(
          owner.group.get(config.mobileKey),
          'duplicateMobile',
          config.messages.duplicateMobile,
        );
        hasConflict = true;
      }
    }

    // 5: fallback name + DOB + mobile when no priority identity document
    for (let i = 0; i < joints.length; i += 1) {
      const joint = joints[i];
      const jointHasId = hasPriorityIdentity(joint, config.identityTypePriority);
      const primaryHasId = hasPriorityIdentity(primary, config.identityTypePriority);

      if (!jointHasId && !primaryHasId && sameFallbackIdentity(primary, joint)) {
        setCrossApplicantError(
          joint.group.get(config.fullNameKey),
          'identityFallback',
          config.messages.identityFallback,
        );
        hasConflict = true;
      }

      for (let j = i + 1; j < joints.length; j += 1) {
        const other = joints[j];
        const otherHasId = hasPriorityIdentity(other, config.identityTypePriority);
        if (jointHasId || otherHasId) {
          continue;
        }
        if (!sameFallbackIdentity(joint, other)) {
          continue;
        }

        setCrossApplicantError(
          joint.group.get(config.fullNameKey),
          'identityFallback',
          config.messages.identityFallback,
        );
        setCrossApplicantError(
          other.group.get(config.fullNameKey),
          'identityFallback',
          config.messages.identityFallback,
        );
        hasConflict = true;
      }
    }

    return hasConflict ? { crossApplicantConflict: true } : null;
  };
}

/** Reads a cross-applicant message from a control error object. */
export function crossApplicantErrorMessage(
  control: AbstractControl | null,
): string | undefined {
  if (!control?.errors) {
    return undefined;
  }

  for (const key of CROSS_APPLICANT_ERROR_KEYS) {
    const error = control.errors[key];
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }
  }

  return undefined;
}
