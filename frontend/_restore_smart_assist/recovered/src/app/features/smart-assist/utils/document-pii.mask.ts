/**
 * Local PII detection/masking for Smart Document Assist privacy.
 * Sensitive identifiers are masked before any text is sent to Gemini.
 * Originals stay in memory for post-AI remapping onto schema identity fields.
 */

export type SensitiveIdentifierType = 'aadhaar' | 'pan' | 'passport';

export interface SensitiveIdentifierMatch {
  type: SensitiveIdentifierType;
  original: string;
  masked: string;
}

export interface DocumentPrivacyMaskResult {
  maskedText: string;
  matches: SensitiveIdentifierMatch[];
}

const AADHAAR_PATTERN = /\b(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})\b/g;
const PAN_PATTERN = /\b([A-Z]{5})([0-9]{4})([A-Z])\b/gi;
/** Common Indian passport forms: letter + 7 digits, or generic alnum 7–9. */
const PASSPORT_PATTERN = /\b([A-Z])([0-9]{7})\b/gi;

function maskAadhaar(original: string): string {
  const digits = original.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return `XXXX XXXX ${last4}`;
}

function maskPan(original: string): string {
  const value = original.toUpperCase();
  return `${value.slice(0, 5)}****${value.slice(-1)}`;
}

function maskPassport(original: string): string {
  const value = original.toUpperCase();
  if (value.length <= 3) {
    return '****';
  }
  return `${value.slice(0, 1)}****${value.slice(-2)}`;
}

/**
 * Masks Aadhaar, PAN, and passport numbers in document text before LLM calls.
 */
export function maskSensitiveIdentifiers(text: string): DocumentPrivacyMaskResult {
  const matches: SensitiveIdentifierMatch[] = [];
  let maskedText = text;

  maskedText = maskedText.replace(AADHAAR_PATTERN, (full, _a, _b, _c) => {
    const original = full;
    const masked = maskAadhaar(original);
    matches.push({ type: 'aadhaar', original: original.replace(/\D/g, ''), masked });
    return masked;
  });

  maskedText = maskedText.replace(PAN_PATTERN, (full, prefix, _digits, suffix) => {
    const original = `${String(prefix)}${String(_digits)}${String(suffix)}`.toUpperCase();
    const masked = maskPan(original);
    matches.push({ type: 'pan', original, masked });
    return masked;
  });

  maskedText = maskedText.replace(PASSPORT_PATTERN, (full) => {
    const original = full.toUpperCase();
    const masked = maskPassport(original);
    matches.push({ type: 'passport', original, masked });
    return masked;
  });

  return { maskedText, matches };
}

function fieldSuggestsType(key: string, label: string, type: SensitiveIdentifierType): boolean {
  const haystack = `${key} ${label}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  switch (type) {
    case 'aadhaar':
      return haystack.includes('aadhaar') || haystack.includes('aadhar') || haystack.includes('uid');
    case 'pan':
      return haystack.includes('pan') && !haystack.includes('panel') && !haystack.includes('company');
    case 'passport':
      return haystack.includes('passport');
    default:
      return false;
  }
}

function looksMasked(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return /x{2,}|\*{2,}/i.test(value);
}

/**
 * Restores locally retained identity values onto schema fields after Gemini returns.
 * Prefers originals when Gemini omitted a value or echoed a masked placeholder.
 */
export function restoreSensitiveValuesOntoSchemaData(
  data: Record<string, unknown>,
  matches: SensitiveIdentifierMatch[],
  fields: Array<{ key: string; label: string }>,
): Record<string, unknown> {
  if (matches.length === 0) {
    return data;
  }

  const restored: Record<string, unknown> = { ...data };
  const usedOriginals = new Set<string>();

  for (const field of fields) {
    for (const match of matches) {
      if (usedOriginals.has(`${match.type}:${match.original}`)) {
        continue;
      }

      if (!fieldSuggestsType(field.key, field.label, match.type)) {
        continue;
      }

      const current = restored[field.key];
      if (
        current === undefined ||
        current === null ||
        current === '' ||
        looksMasked(current) ||
        String(current) === match.masked
      ) {
        restored[field.key] = match.original;
        usedOriginals.add(`${match.type}:${match.original}`);
        break;
      }
    }
  }

  // Also replace any masked string values elsewhere that exactly match a known mask.
  for (const [key, value] of Object.entries(restored)) {
    if (typeof value !== 'string') {
      continue;
    }
    const match = matches.find((entry) => entry.masked === value || looksMasked(value) && entry.masked.replace(/\s/g, '') === value.replace(/\s/g, ''));
    if (match) {
      restored[key] = match.original;
    }
  }

  return restored;
}
