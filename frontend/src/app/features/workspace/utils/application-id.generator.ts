import { APPLICATION_ID_PREFIX } from '../models/workspace.model';

/**
 * Generates sequential application IDs like ACC-001, LOAN-001.
 * Counters are provided by the caller (persisted per prefix).
 */
export function nextApplicationId(formType: string, nextSequence: number): string {
  const prefix = APPLICATION_ID_PREFIX[formType] ?? 'APP';
  const sequence = Math.max(1, Math.floor(nextSequence));
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}
