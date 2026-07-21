import { Field } from '../../../models/field.model';

/** Resolves initial control values per schema-contract.md §11. */
export function resolveFieldDefaultValue(field: Field): unknown {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return '';
    case 'dropdown':
      return null;
    case 'multiselect':
      return [];
    case 'checkbox':
      return false;
    case 'file':
      return null;
    case 'repeater':
      return [];
    default:
      return '';
  }
}
