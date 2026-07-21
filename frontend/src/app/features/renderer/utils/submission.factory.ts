import { FormArray, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import {
  FileSubmissionValue,
  Submission,
  SubmissionValue,
} from '../../../models/submission.model';

import { shouldIncludeFieldInSubmission } from './field-visibility.util';

/** Assembles a Submission from visible field values, preserving nested repeater arrays. */
export function buildSubmission(schema: FormSchema, form: FormGroup): Submission {
  return buildSubmissionFromFields(schema.fields, form);
}

function buildSubmissionFromFields(fields: Field[], form: FormGroup): Submission {
  const submission: Submission = {};

  for (const field of fields) {
    if (!shouldIncludeFieldInSubmission(field, form)) {
      continue;
    }

    submission[field.key] = resolveSubmissionValue(field, form.get(field.key));
  }

  return submission;
}

function resolveSubmissionValue(
  field: Field,
  control: ReturnType<FormGroup['get']>,
): SubmissionValue {
  if (field.type === 'repeater') {
    if (!(control instanceof FormArray)) {
      return [];
    }

    const rows: Record<string, SubmissionValue>[] = [];

    for (let index = 0; index < control.length; index += 1) {
      const row = control.at(index);
      if (!(row instanceof FormGroup)) {
        continue;
      }

      rows.push(buildSubmissionFromFields(field.fields ?? [], row));
    }

    return rows;
  }

  const rawValue = control?.value;

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return rawValue == null ? '' : String(rawValue);
    case 'dropdown':
      return rawValue == null ? '' : String(rawValue);
    case 'multiselect':
      return Array.isArray(rawValue) ? [...rawValue] : [];
    case 'checkbox':
      return Boolean(rawValue);
    case 'file':
      return normalizeFileValue(rawValue);
    default:
      return '';
  }
}

function normalizeFileValue(rawValue: unknown): FileSubmissionValue | null {
  if (!rawValue || typeof rawValue !== 'object') {
    return null;
  }

  const candidate = rawValue as Partial<FileSubmissionValue>;
  if (!candidate.name) {
    return null;
  }

  return {
    name: String(candidate.name),
    size: Number(candidate.size) || 0,
    type: String(candidate.type ?? ''),
  };
}

/** @internal exported for nested PDF helpers */
export function buildRowSubmission(fields: Field[], row: FormGroup): Submission {
  return buildSubmissionFromFields(fields, row);
}
