import { Injectable, inject } from '@angular/core';

import { FormSchema } from '../../../models/form-schema.model';
import {
  maskSensitiveIdentifiers,
  restoreSensitiveValuesOntoSchemaData,
} from '../utils/document-pii.mask';
import {
  AI_EXTRACTION_FAILURE_MESSAGE,
  AIExtractionResult,
  AILanguageModelProvider,
  sanitizeAIExtractionData,
} from './ai-extraction.types';
import { GeminiLanguageModelProvider } from './gemini-language-model.provider';

/**
 * Orchestrates REAL Gemini-backed document understanding for Smart Document Assist.
 *
 * Flow:
 * 1. Mask Aadhaar / PAN / passport locally.
 * 2. Send masked text + active schema to Gemini (via pluggable provider).
 * 3. Restore original identity values onto matching schema fields.
 * 4. Return structured JSON for FieldMappingService → patchValue().
 *
 * The DynamicFormRenderer never calls Gemini directly.
 */
@Injectable({ providedIn: 'root' })
export class AIExtractionService {
  private readonly geminiProvider = inject(GeminiLanguageModelProvider);
  private provider: AILanguageModelProvider = this.geminiProvider;

  setProvider(provider: AILanguageModelProvider): void {
    this.provider = provider;
  }

  resetProvider(): void {
    this.provider = this.geminiProvider;
  }

  getActiveProviderName(): string {
    return this.provider.name;
  }

  /**
   * Sends privacy-masked document text + active schema to the configured LLM
   * and returns structured JSON keyed by schema field keys.
   */
  async extractStructuredFields(
    schema: FormSchema,
    documentText: string,
  ): Promise<AIExtractionResult> {
    const text = documentText.trim();
    if (!text) {
      return {
        success: false,
        errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
      };
    }

    const privacy = maskSensitiveIdentifiers(text);

    try {
      const result = await this.provider.extractStructuredData(schema, privacy.maskedText);

      if (!result.success || !result.data) {
        return {
          success: false,
          errorMessage: result.errorMessage ?? AI_EXTRACTION_FAILURE_MESSAGE,
          rawResponse: result.rawResponse,
        };
      }

      const restored = restoreSensitiveValuesOntoSchemaData(
        result.data,
        privacy.matches,
        schema.fields.map((field) => ({ key: field.key, label: field.label })),
      );

      const data = sanitizeAIExtractionData(restored);
      if (Object.keys(data).length === 0) {
        return {
          success: false,
          errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
          rawResponse: result.rawResponse,
        };
      }

      return {
        success: true,
        data,
        rawResponse: result.rawResponse,
      };
    } catch {
      return {
        success: false,
        errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
      };
    }
  }
}
