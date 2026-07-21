/** Supported field types per schema-contract.md §6 (extended with repeater + file). */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'dropdown'
  | 'multiselect'
  | 'checkbox'
  | 'repeater'
  | 'file';
