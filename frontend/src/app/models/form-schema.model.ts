import { Field } from './field.model';
import { CrossApplicantValidationConfig } from './cross-applicant-validation.model';

/** Root form schema per schema-contract.md §4 */
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  submitLabel?: string;
  fields: Field[];
  /** Optional form-level cross-applicant uniqueness rules (schema-driven). */
  crossApplicantValidation?: CrossApplicantValidationConfig;
}

/** Default submit button label when omitted from schema. */
export const DEFAULT_SUBMIT_LABEL = 'Submit';
