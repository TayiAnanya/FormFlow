import { Injectable } from '@angular/core';

import { DEFAULT_SUBMIT_LABEL, FormSchema } from '../models/form-schema.model';
import { SchemaLoadResult } from '../models/schema-load-result.model';
import { BUNDLED_SCHEMAS } from '../schemas/bundled';
import { validateFormSchemaRoot } from '../utils/schema-validator';

/**
 * Resolves bundled FormSchema configuration by id.
 * Demo-agnostic: no banking business rules; schema data only.
 */
@Injectable({ providedIn: 'root' })
export class SchemaLoaderService {
  loadById(schemaId: string): SchemaLoadResult {
    if (!schemaId.trim()) {
      return {
        status: 'not-found',
        message: 'No form schema identifier was provided.',
      };
    }

    const schema = BUNDLED_SCHEMAS[schemaId];

    if (!schema) {
      return {
        status: 'not-found',
        message: `No bundled form schema was found for id "${schemaId}".`,
      };
    }

    const validationError = validateFormSchemaRoot(schema);

    if (validationError) {
      return {
        status: 'invalid',
        message: validationError,
      };
    }

    return {
      status: 'success',
      schema,
    };
  }

  resolveSubmitLabel(schema: FormSchema): string {
    return schema.submitLabel ?? DEFAULT_SUBMIT_LABEL;
  }
}
