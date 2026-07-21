import { Injectable } from '@angular/core';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { ExtractedDocumentData, MappedFormValues } from '../models/document-extraction.model';

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Maps extracted text to a dropdown/multiselect option value using schema option labels. */
function mapOptionValue(field: Field, rawValue: unknown): unknown {
  if (!field.options?.length) {
    return rawValue;
  }

  if (field.type === 'multiselect') {
    const parts = Array.isArray(rawValue)
      ? rawValue.map((entry) => String(entry))
      : String(rawValue)
          .split(/[,|/]/)
          .map((part) => part.trim())
          .filter(Boolean);

    const mapped = parts
      .map((part) => {
        const option = field.options?.find(
          (entry) =>
            entry.value.toLowerCase() === part.toLowerCase() ||
            entry.label.toLowerCase() === part.toLowerCase(),
        );
        return option?.value;
      })
      .filter((value): value is string => Boolean(value));

    return mapped.length > 0 ? mapped : undefined;
  }

  if (field.type === 'dropdown') {
    const stringValue = String(rawValue);
    const option = field.options.find(
      (entry) =>
        entry.value.toLowerCase() === stringValue.toLowerCase() ||
        entry.label.toLowerCase() === stringValue.toLowerCase(),
    );
    return option?.value ?? stringValue;
  }

  return rawValue;
}

/**
 * Resolves an AI/extracted property onto a schema field using the active schema only.
 * Exact key/label matches first, then generic containment (e.g. name → fullName).
 */
function resolveFieldForProperty(schema: FormSchema, property: string): Field | undefined {
  const normalizedProperty = normalizeKey(property);
  if (!normalizedProperty) {
    return undefined;
  }

  let bestField: Field | undefined;
  let bestScore = 0;

  for (const field of schema.fields) {
    const keyNorm = normalizeKey(field.key);
    const labelNorm = normalizeKey(field.label);

    let score = 0;
    if (keyNorm === normalizedProperty || labelNorm === normalizedProperty) {
      score = 100;
    } else if (keyNorm.includes(normalizedProperty) || normalizedProperty.includes(keyNorm)) {
      score = 80 + Math.min(keyNorm.length, normalizedProperty.length);
    } else if (labelNorm.includes(normalizedProperty) || normalizedProperty.includes(labelNorm)) {
      score = 70 + Math.min(labelNorm.length, normalizedProperty.length);
    }

    if (score > bestScore) {
      bestScore = score;
      bestField = field;
    }
  }

  return bestScore >= 70 ? bestField : undefined;
}

@Injectable({ providedIn: 'root' })
export class FieldMappingService {
  /**
   * Maps Gemini/extracted JSON onto the active schema.
   * Dropdown/multiselect values are resolved against schema option labels.
   */
  mapToSchemaFields(schema: FormSchema, extracted: ExtractedDocumentData): MappedFormValues {
    const mapped: MappedFormValues = {};

    for (const [property, value] of Object.entries(extracted)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      const field = resolveFieldForProperty(schema, property);
      if (!field || field.hidden === true) {
        continue;
      }

      const mappedValue = mapOptionValue(field, value);
      if (mappedValue === undefined || mappedValue === '') {
        continue;
      }

      console.log(`[Smart Assist] Mapped "${property}" → ${field.key}:`, mappedValue);
      mapped[field.key] = mappedValue;
    }

    return mapped;
  }
}
