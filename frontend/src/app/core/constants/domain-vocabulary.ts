/**
 * Shared domain language per data-model.md and schema-contract.md.
 * Entity types and interfaces are introduced in later implementation tasks.
 */
export const DOMAIN_ENTITIES = [
  'FormSchema',
  'Field',
  'FieldType',
  'Validation',
  'ValidationMessages',
  'Option',
  'FormScenario',
  'FormState',
  'FieldValue',
  'Submission',
] as const;

export type DomainEntity = (typeof DOMAIN_ENTITIES)[number];
