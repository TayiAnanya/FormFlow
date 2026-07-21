/** Conditional visibility rule per schema-contract.md §9 (bonus — FF-010). */
export interface VisibilityRule {
  field: string;
  operator: 'equals';
  value: unknown;
}
