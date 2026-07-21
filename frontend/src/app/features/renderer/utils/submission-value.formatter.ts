import { Field } from '../../../models/field.model';
import { FileSubmissionValue, SubmissionValue } from '../../../models/submission.model';

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Resolves a dropdown or multiselect option label from its stored value. */
function resolveOptionLabel(field: Field, value: string): string | undefined {
  return field.options?.find((option) => option.value === value)?.label;
}

/** Formats an ISO date string (yyyy-MM-dd) for human-readable display. */
export function formatDisplayDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return value;
  }

  return DISPLAY_DATE_FORMATTER.format(date);
}

function isFileSubmissionValue(value: unknown): value is FileSubmissionValue {
  return Boolean(value && typeof value === 'object' && 'name' in (value as object));
}

/** Formats a submitted field value for display in PDF output. */
export function formatSubmissionDisplayValue(field: Field, value: SubmissionValue): string {
  switch (field.type) {
    case 'checkbox':
      return value === true ? 'Yes' : 'No';
    case 'dropdown': {
      const stored = value == null ? '' : String(value);
      return resolveOptionLabel(field, stored) ?? stored;
    }
    case 'multiselect': {
      const values = Array.isArray(value) ? value : [];

      if (values.length === 0 || typeof values[0] !== 'string') {
        return '';
      }

      return (values as string[])
        .map((entry) => resolveOptionLabel(field, entry) ?? entry)
        .join(', ');
    }
    case 'date': {
      const stored = value == null ? '' : String(value);
      return stored ? formatDisplayDate(stored) : '';
    }
    case 'file': {
      if (!isFileSubmissionValue(value)) {
        return '';
      }
      return value.name;
    }
    case 'repeater':
      return Array.isArray(value) ? `${value.length} item(s)` : '';
    default:
      return value == null ? '' : String(value);
  }
}
