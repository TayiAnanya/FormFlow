import { FieldType } from './field-type.model';
import { Validation } from './validation.model';
import { VisibilityRule } from './visibility-rule.model';

/** Option for dropdown and multiselect fields per schema-contract.md §8 */
export interface FieldOption {
  label: string;
  value: string;
}

/** Field definition per schema-contract.md §5 (extended for repeater + file). */
export interface Field {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: Validation;
  options?: FieldOption[];
  /** Conditional visibility — evaluated against the parent FormGroup (row-scoped for nested fields). */
  visibleWhen?: VisibilityRule;
  /** Hidden field — omitted from render and submission. */
  hidden?: boolean;
  /** Disabled field — rendered but not interactive. */
  disabled?: boolean;
  /** Readonly field — displayed but not editable. */
  readonly?: boolean;

  /** Nested child fields for `type: 'repeater'`. */
  fields?: Field[];
  /** Minimum number of repeater rows (FormArray-level). */
  minItems?: number;
  /** Maximum number of repeater rows (FormArray-level). */
  maxItems?: number;
  /** Label for the add-row button. */
  addButtonText?: string;
  /** Label for each row's remove button. */
  removeButtonText?: string;
  /** Row heading template; `{{index}}` is replaced with 1-based index. */
  itemLabel?: string;
  /** Optional `accept` attribute for `type: 'file'` inputs. */
  accept?: string;
  /**
   * Optional presentation-only section heading.
   * Does not affect validation, visibility, or submission behaviour.
   */
  section?: string;
}
