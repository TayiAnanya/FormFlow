import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { MappedFormValues } from '../../smart-assist/models/document-extraction.model';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldConfidenceIndicator {
  key: string;
  label: string;
  displayValue: string;
  confidence: number;
  level: ConfidenceLevel;
}

export interface VoiceReportInsights {
  summary: string;
  overallConfidence: number;
  overallLevel: ConfidenceLevel;
  fields: FieldConfidenceIndicator[];
}

function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) {
    return 'high';
  }
  if (score >= 0.55) {
    return 'medium';
  }
  return 'low';
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(', ');
  }
  return String(value);
}

function scoreField(field: Field, value: unknown, speechConfidence: number | null): number {
  const text = displayValue(value).trim();
  if (!text) {
    return 0.2;
  }

  let score = 0.7;

  if (field.type === 'dropdown' && field.options?.length) {
    const matched = field.options.some(
      (option) => option.value === text || option.label.toLowerCase() === text.toLowerCase(),
    );
    score = matched ? 0.92 : 0.55;
  } else if (field.validation?.pattern) {
    try {
      score = new RegExp(field.validation.pattern).test(text) ? 0.9 : 0.5;
    } catch {
      score = 0.7;
    }
  } else if (text.length >= 8) {
    score = 0.82;
  }

  if (speechConfidence !== null) {
    score = score * 0.65 + speechConfidence * 0.35;
  }

  return Math.max(0.05, Math.min(0.99, score));
}

function pickLabel(schema: FormSchema, key: string): string {
  return schema.fields.find((field) => field.key === key)?.label ?? key;
}

/**
 * Builds an AI-style report summary and per-field confidence indicators
 * from the extracted schema values (presentation only — does not call the LLM again).
 */
export function buildVoiceReportInsights(
  schema: FormSchema,
  mapped: MappedFormValues,
  transcript: string,
  speechConfidence: number | null = null,
): VoiceReportInsights {
  const fields: FieldConfidenceIndicator[] = Object.entries(mapped).map(([key, value]) => {
    const field = schema.fields.find((entry) => entry.key === key);
    const confidence = scoreField(
      field ?? { key, type: 'text', label: key },
      value,
      speechConfidence,
    );

    return {
      key,
      label: field?.label ?? pickLabel(schema, key),
      displayValue: displayValue(value),
      confidence,
      level: confidenceLevel(confidence),
    };
  });

  fields.sort((a, b) => b.confidence - a.confidence);

  const overallConfidence =
    fields.length === 0
      ? speechConfidence ?? 0.4
      : fields.reduce((sum, entry) => sum + entry.confidence, 0) / fields.length;

  const merchant = displayValue(mapped['fraudMerchant'] ?? mapped['merchantName']);
  const amount = displayValue(mapped['fraudAmount'] ?? mapped['disputeAmount']);
  const card = displayValue(mapped['fraudCardLast4'] ?? mapped['cardLastFourDigits']);
  const fraudType = displayValue(mapped['fraudType']);
  const requestType = displayValue(mapped['supportRequestType']);

  const highlights: string[] = [];
  if (requestType === 'report_fraud' || fraudType) {
    highlights.push('a suspected fraud report');
  }
  if (card) {
    highlights.push(`card ending ${card}`);
  }
  if (merchant) {
    highlights.push(`activity at ${merchant}`);
  }
  if (amount) {
    highlights.push(`amount ₹${amount}`);
  }

  const highlightText =
    highlights.length > 0
      ? highlights.join(', ').replace(/, ([^,]*)$/, ', and $1')
      : 'the details you described';

  const trimmedTranscript = transcript.trim();
  const summary = trimmedTranscript
    ? `We analysed your spoken report and identified ${highlightText}. The Support Center form has been filled from your description — please review every field before submitting.`
    : `We extracted ${fields.length} field(s) from your report. Please review the populated values before submitting.`;

  return {
    summary,
    overallConfidence,
    overallLevel: confidenceLevel(overallConfidence),
    fields,
  };
}
