import { TestBed } from '@angular/core/testing';

import { FormSchema } from '../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../schemas/bundled/account-opening.schema';
import { BUNDLED_SCHEMAS } from '../schemas/bundled';

import { SchemaLoaderService } from './schema-loader.service';

describe('SchemaLoaderService', () => {
  let service: SchemaLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchemaLoaderService);
  });

  it('loads an existing bundled schema successfully', () => {
    const result = service.loadById('account-opening');

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.schema).toBe(ACCOUNT_OPENING_SCHEMA);
    }
  });

  it('returns not-found when the schema id is missing', () => {
    const result = service.loadById('does-not-exist');

    expect(result.status).toBe('not-found');
    if (result.status === 'not-found') {
      expect(result.message).toContain('does-not-exist');
    }
  });

  it('returns not-found when the schema id is blank', () => {
    const result = service.loadById('   ');

    expect(result.status).toBe('not-found');
    if (result.status === 'not-found') {
      expect(result.message).toContain('No form schema identifier was provided');
    }
  });

  it('returns invalid when root validation fails', () => {
    const invalidSchema = {
      id: 'invalid-test-schema',
      title: 'Invalid Test Schema',
      fields: null,
    } as unknown as FormSchema;

    BUNDLED_SCHEMAS['invalid-test-schema'] = invalidSchema;

    try {
      const result = service.loadById('invalid-test-schema');

      expect(result.status).toBe('invalid');
      if (result.status === 'invalid') {
        expect(result.message).toContain('fields');
      }
    } finally {
      delete BUNDLED_SCHEMAS['invalid-test-schema'];
    }
  });

  it('looks up schemas from the bundled registry by id', () => {
    const ids = Object.keys(BUNDLED_SCHEMAS);

    for (const id of ids) {
      const result = service.loadById(id);
      expect(result.status).withContext(id).toBe('success');
      if (result.status === 'success') {
        expect(result.schema.id).toBe(id);
      }
    }
  });

  it('resolves the submit label from the schema with a default fallback', () => {
    expect(service.resolveSubmitLabel(ACCOUNT_OPENING_SCHEMA)).toBe('Submit Application');
    expect(service.resolveSubmitLabel({ ...ACCOUNT_OPENING_SCHEMA, submitLabel: undefined })).toBe(
      'Submit',
    );
  });
});
