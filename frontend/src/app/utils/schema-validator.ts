import { FormSchema } from '../models/form-schema.model';

/**
 * Validates required root properties per schema-contract.md §4 and FF-003.
 * Field-level validation is deferred to FF-005+.
 */
export function validateFormSchemaRoot(schema: unknown): string | null {
  if (!schema || typeof schema !== 'object') {
    return 'The form schema is not a valid configuration object.';
  }

  const candidate = schema as Record<string, unknown>;

  if (typeof candidate['id'] !== 'string' || candidate['id'].trim() === '') {
    return 'The form schema is missing a required root property: id.';
  }

  if (typeof candidate['title'] !== 'string' || candidate['title'].trim() === '') {
    return 'The form schema is missing a required root property: title.';
  }

  if (!Array.isArray(candidate['fields'])) {
    return 'The form schema is missing a required root property: fields.';
  }

  return null;
}

export function isFormSchema(schema: unknown): schema is FormSchema {
  return validateFormSchemaRoot(schema) === null;
}
