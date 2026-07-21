/**
 * Schema-driven configuration for cross-applicant uniqueness validation.
 * Attached to FormSchema so the validator stays reusable and banking-agnostic.
 */
export interface CrossApplicantValidationConfig {
  /** FormArray key holding joint/additional applicants. */
  repeaterKey: string;
  fullNameKey: string;
  dateOfBirthKey: string;
  emailKey: string;
  mobileKey: string;
  idTypeKey: string;
  idNumberKey: string;
  /**
   * Identity document type values compared in priority order
   * (e.g. aadhaar → pan → passport).
   */
  identityTypePriority: string[];
  messages: {
    matchesPrimary: string;
    duplicateJoint: string;
    duplicateEmail: string;
    duplicateMobile: string;
    identityFallback: string;
  };
}
