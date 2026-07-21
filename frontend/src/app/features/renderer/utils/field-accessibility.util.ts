import { Field } from '../../../models/field.model';

const AUTOCOMPLETE_BY_FIELD_KEY: Record<string, string> = {
  fullName: 'name',
  applicantName: 'name',
  email: 'email',
  dateOfBirth: 'bday',
};

/** Stable control id derived from field.key for label association. */
export function fieldControlId(field: Field): string {
  return field.key;
}

/** Returns a supported autocomplete token when applicable. */
export function resolveFieldAutocomplete(field: Field): string | undefined {
  return AUTOCOMPLETE_BY_FIELD_KEY[field.key];
}
