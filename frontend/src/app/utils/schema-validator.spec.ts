import { FormSchema } from '../models/form-schema.model';

import { isFormSchema, validateFormSchemaRoot } from './schema-validator';

describe('validateFormSchemaRoot', () => {
  const validSchema: FormSchema = {
    id: 'test-form',
    title: 'Test Form',
    fields: [],
  };

  it('returns null for a valid schema', () => {
    expect(validateFormSchemaRoot(validSchema)).toBeNull();
  });

  it('returns an error when id is missing', () => {
    const schema = { title: 'Test Form', fields: [] };

    expect(validateFormSchemaRoot(schema)).toBe(
      'The form schema is missing a required root property: id.',
    );
  });

  it('returns an error when title is missing', () => {
    const schema = { id: 'test-form', fields: [] };

    expect(validateFormSchemaRoot(schema)).toBe(
      'The form schema is missing a required root property: title.',
    );
  });

  it('returns an error when fields is missing', () => {
    const schema = { id: 'test-form', title: 'Test Form' };

    expect(validateFormSchemaRoot(schema)).toBe(
      'The form schema is missing a required root property: fields.',
    );
  });

  it('returns an error for an invalid root value', () => {
    expect(validateFormSchemaRoot(null)).toBe(
      'The form schema is not a valid configuration object.',
    );
    expect(validateFormSchemaRoot('invalid')).toBe(
      'The form schema is not a valid configuration object.',
    );
  });

  it('narrows the type with isFormSchema when valid', () => {
    expect(isFormSchema(validSchema)).toBeTrue();
    expect(isFormSchema({ id: '', title: 'X', fields: [] })).toBeFalse();
  });
});
