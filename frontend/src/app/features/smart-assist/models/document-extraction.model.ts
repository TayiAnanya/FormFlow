/** Structured output from the frontend document parser. */
export interface ExtractedDocumentData {
  [property: string]: unknown;
}

export interface DocumentExtractionResult {
  success: boolean;
  data?: ExtractedDocumentData;
  errorMessage?: string;
}

/** Values ready to patch into a reactive form after schema-driven mapping. */
export interface MappedFormValues {
  [fieldKey: string]: unknown;
}

export interface PatchFormOptions {
  /** When false, fields that already have user-entered values are skipped. */
  overwriteExisting?: boolean;
}

export interface PatchFormResult {
  patched: MappedFormValues;
  skipped: string[];
}

/** Emitted when the user confirms applying extracted values to the form. */
export interface SmartAssistPatchRequest {
  values: MappedFormValues;
  overwriteExisting: boolean;
}
