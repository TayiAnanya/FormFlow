import { FormGroup } from '@angular/forms';

import { FormSchema } from '../../../models/form-schema.model';

import { buildFormGroup } from './form-model.factory';

/**
 * Initialises a fresh FormState from schema defaults.
 * @see data-model.md §13.6, spec.md EC-09
 */
export function initializeFormState(schema: FormSchema): FormGroup {
  return buildFormGroup(schema);
}
