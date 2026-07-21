import { FormSchema } from '../../../models/form-schema.model';
import { ExtractedDocumentData } from '../models/document-extraction.model';

/** Friendly fallback when Gemini or the network fails. */
export const AI_EXTRACTION_FAILURE_MESSAGE =
  'Unable to analyse the document automatically. Please continue filling the form manually.';

/** Result of an LLM-backed structured extraction pass. */
export interface AIExtractionResult {
  success: boolean;
  data?: ExtractedDocumentData;
  errorMessage?: string;
  rawResponse?: string;
}

/**
 * Pluggable LLM provider contract.
 * Swap Gemini for Azure OpenAI / OpenAI / Claude without changing the renderer.
 */
export interface AILanguageModelProvider {
  readonly name: string;
  extractStructuredData(schema: FormSchema, documentText: string): Promise<AIExtractionResult>;
}

/** Builds a compact schema summary for the LLM prompt (no business hardcoding). */
export function buildSchemaPromptPayload(schema: FormSchema): unknown {
  return {
    id: schema.id,
    title: schema.title,
    description: schema.description,
    fields: schema.fields
      .filter((field) => field.hidden !== true)
      .map((field) => ({
        key: field.key,
        type: field.type,
        label: field.label,
        readonly: field.readonly === true,
        options: field.options?.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        visibleWhen: field.visibleWhen,
      })),
  };
}

/**
 * Gemini system/user prompt for semantic banking document extraction.
 * Intelligence is delegated to the LLM — no regex field mapping.
 */
export function buildDocumentExtractionPrompt(schema: FormSchema, documentText: string): string {
  const schemaJson = JSON.stringify(buildSchemaPromptPayload(schema), null, 2);

  return `You are an intelligent banking document extraction assistant.

You will receive:
1. A JSON schema describing the current banking form.
2. Extracted text from a banking document.

Your task is to understand the document semantically and return ONLY valid JSON.

Rules
- Only return fields that exist in the supplied schema (use each field's "key" as the JSON key).
- Never invent values.
- Leave missing fields empty (omit them or use an empty string).
- Understand synonymous labels.

Examples
Name -> fullName
DOB -> dateOfBirth
Birth Date -> dateOfBirth
Current A/c -> accountType
Gross Salary -> monthlyIncome
PAN -> panNumber
Aadhaar Number -> aadhaarNumber

Additional rules:
- Prefer schema option "value" entries for dropdowns/multiselects when the document wording matches an option label or value.
- Prefer YYYY-MM-DD for dates when possible.
- Some identity numbers may appear masked (e.g. XXXX XXXX 9012). Preserve them as returned; do not invent digits.
- Return ONLY JSON. No markdown. No commentary.

Current Schema:
${schemaJson}

Extracted Document Text:
${documentText}`;
}

/**
 * Parses LLM text into JSON object data.
 * Tolerates optional markdown fences but rejects non-object payloads.
 */
export function parseAIJsonResponse(raw: string): ExtractedDocumentData | null {
  if (!raw?.trim()) {
    return null;
  }

  let candidate = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(candidate);
  if (fenced) {
    candidate = fenced[1].trim();
  }

  try {
    const parsed: unknown = JSON.parse(candidate);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as ExtractedDocumentData;
  } catch {
    return null;
  }
}

/** Drops empty / null values so the form is not patched with blanks. */
export function sanitizeAIExtractionData(data: ExtractedDocumentData): ExtractedDocumentData {
  const sanitized: ExtractedDocumentData = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      continue;
    }

    sanitized[key] = typeof value === 'string' ? value.trim() : value;
  }

  return sanitized;
}
