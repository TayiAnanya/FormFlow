/** Validation error messages per schema-contract.md §7.2 */

export interface ValidationMessages {

  required?: string;

  pattern?: string;

  minLength?: string;

  maxLength?: string;

  min?: string;

  max?: string;

  futureDate?: string;

  minimumAge?: string;

  maximumAge?: string;

  minItems?: string;

  maxItems?: string;

}



/** Field validation rules per schema-contract.md §7 */

export interface Validation {

  required?: boolean;

  pattern?: string;

  minLength?: number;

  maxLength?: number;

  min?: number;

  max?: number;

  /** Minimum age in years for date fields. */

  minimumAge?: number;

  /** Maximum age in years for date fields. */

  maximumAge?: number;

  /** When false, dates after today are rejected. */

  allowFutureDates?: boolean;

  messages?: ValidationMessages;

}

