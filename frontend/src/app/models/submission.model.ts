/** Client-side file metadata captured by `type: 'file'` fields (no backend upload). */
export interface FileSubmissionValue {
  name: string;
  size: number;
  type: string;
}

/**
 * Type-appropriate captured value for a single field in a Submission.
 * @see data-model.md §4.5, §11.3
 */
export type SubmissionValue =
  | string
  | string[]
  | boolean
  | FileSubmissionValue
  | null
  | Record<string, SubmissionValue>[];

/**
 * Submission output keyed by Field.key values.
 * May contain nested arrays for repeater fields (not flattened).
 * @see data-model.md §11
 */
export type Submission = Record<string, SubmissionValue>;
