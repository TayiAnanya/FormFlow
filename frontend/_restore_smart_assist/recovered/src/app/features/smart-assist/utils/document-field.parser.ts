/**
 * Schema-driven document field extraction.
 * Searches extracted PDF text using each active schema field's label — no hardcoded banking names.
 */

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { ExtractedDocumentData } from '../models/document-extraction.model';

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeForMatch(value: string): string {
  return normalizeWhitespace(value).toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanExtractedValue(raw: string): string {
  return normalizeWhitespace(raw.replace(/^[:\-–—]+\s*/, ''));
}

function isLikelyLabelLine(line: string, knownLabels: string[]): boolean {
  const normalized = normalizeForMatch(line);
  return knownLabels.some((label) => normalizeForMatch(label) === normalized);
}

/**
 * Finds the value that follows a schema field label in document text.
 * Supports:
 * - Label on one line, value on the next
 * - Label: value / Label - value on the same line
 */
export function findValueAfterLabel(
  text: string,
  label: string,
  knownLabels: string[] = [],
): string | undefined {
  if (!text.trim() || !label.trim()) {
    return undefined;
  }

  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const normalizedLabel = normalizeForMatch(label);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const normalizedLine = normalizeForMatch(line);

    // Exact label line → value is on the following line.
    if (normalizedLine === normalizedLabel) {
      const next = lines[index + 1];
      if (!next || isLikelyLabelLine(next, knownLabels)) {
        return undefined;
      }
      const value = cleanExtractedValue(next);
      return value || undefined;
    }

    // Same-line patterns: "Label: value" / "Label - value" / "Label value"
    if (normalizedLine.startsWith(normalizedLabel)) {
      const labelMatch = new RegExp(`^${escapeRegExp(label)}\\s*[:\\-–—]?\\s*(.*)$`, 'i').exec(line);
      const remainder = labelMatch?.[1]?.trim() ?? '';
      if (remainder) {
        const value = cleanExtractedValue(remainder);
        return value || undefined;
      }

      const next = lines[index + 1];
      if (!next || isLikelyLabelLine(next, knownLabels)) {
        return undefined;
      }
      const value = cleanExtractedValue(next);
      return value || undefined;
    }
  }

  // Fallback for flattened PDF text blobs without reliable newlines.
  const flattened = normalizeWhitespace(text);
  const flattenedMatch = new RegExp(
    `${escapeRegExp(label)}\\s*[:\\-–—]?\\s+(.+?)(?=(?:\\s+(?:${knownLabels
      .filter((entry) => normalizeForMatch(entry) !== normalizedLabel)
      .map((entry) => escapeRegExp(entry))
      .join('|')})\\b)|$)`,
    'i',
  ).exec(flattened);

  if (flattenedMatch?.[1]) {
    const value = cleanExtractedValue(flattenedMatch[1]);
    return value || undefined;
  }

  return undefined;
}

function shouldSearchField(field: Field): boolean {
  if (field.hidden === true) {
    return false;
  }

  if (!field.label?.trim()) {
    return false;
  }

  // Checkbox declaration labels are usually absent from identity documents.
  if (field.type === 'checkbox') {
    return false;
  }

  return true;
}

/**
 * For every searchable schema field, look up its label in the document text
 * and capture the following value. Missing labels are ignored.
 */
export function extractFieldsBySchemaLabels(
  schema: FormSchema,
  text: string,
  options: { debug?: boolean } = {},
): ExtractedDocumentData {
  const extracted: ExtractedDocumentData = {};
  const debug = options.debug !== false;
  const searchableFields = schema.fields.filter(shouldSearchField);
  const knownLabels = searchableFields.map((field) => field.label);

  if (debug) {
    console.log('[Smart Assist] Extracting fields using active schema labels', {
      schemaId: schema.id,
      fieldCount: searchableFields.length,
    });
  }

  for (const field of searchableFields) {
    if (debug) {
      console.log(`Searching for:\n${field.label}`);
    }

    const value = findValueAfterLabel(text, field.label, knownLabels);
    if (!value) {
      if (debug) {
        console.log(`Found:\n(not found)\n`);
      }
      continue;
    }

    if (debug) {
      console.log(`Found:\n${value}\n`);
    }

    extracted[field.key] = value;
  }

  return extracted;
}

/** @deprecated Prefer extractFieldsBySchemaLabels with the active schema. */
export function parseDocumentText(text: string): ExtractedDocumentData {
  if (!text.trim()) {
    return {};
  }

  // Minimal fallback: capture generic "Label: value" pairs keyed by normalized label text.
  const extracted: ExtractedDocumentData = {};
  const labeledLine = /^([A-Za-z][A-Za-z0-9 .'/()&-]{0,60}?)\s*[:\-]\s*(.+)$/;

  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = line.trim();
    const match = labeledLine.exec(trimmed);
    if (!match) {
      continue;
    }

    const labelKey = match[1].trim();
    const value = cleanExtractedValue(match[2]);
    if (value && extracted[labelKey] === undefined) {
      extracted[labelKey] = value;
    }
  }

  return extracted;
}
