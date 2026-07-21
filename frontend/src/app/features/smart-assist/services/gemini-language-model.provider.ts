import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { FormSchema } from '../../../models/form-schema.model';
import { environment } from '../../../../environments/environment';
import {
  AI_EXTRACTION_FAILURE_MESSAGE,
  AIExtractionResult,
  AILanguageModelProvider,
  buildDocumentExtractionPrompt,
  parseAIJsonResponse,
  sanitizeAIExtractionData,
} from './ai-extraction.types';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

/**
 * Real Gemini API language-model provider.
 * Calls Google Generative Language API — no mock extraction payloads.
 */
@Injectable({ providedIn: 'root' })
export class GeminiLanguageModelProvider implements AILanguageModelProvider {
  readonly name = 'gemini';

  private readonly http = inject(HttpClient);

  async extractStructuredData(schema: FormSchema, documentText: string): Promise<AIExtractionResult> {
    const prompt = buildDocumentExtractionPrompt(schema, documentText);
    return this.generateStructuredJson(prompt);
  }

  async generateStructuredJson(prompt: string): Promise<AIExtractionResult> {
    const apiKey = environment.geminiApiKey?.trim();
    if (!apiKey) {
      return {
        success: false,
        errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
      };
    }

    const model = environment.geminiModel || 'gemini-flash-latest';
    const baseUrl = environment.geminiApiBaseUrl.replace(/\/$/, '');
    const url = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await firstValueFrom(
        this.http.post<GeminiGenerateContentResponse>(url, {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      );

      const rawText =
        response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim() ??
        '';

      if (!rawText) {
        console.warn('[Smart Assist][Gemini] Empty model response', response);
        return {
          success: false,
          errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
          rawResponse: JSON.stringify(response),
        };
      }

      const parsed = parseAIJsonResponse(rawText);
      if (!parsed) {
        console.warn('[Smart Assist][Gemini] Invalid JSON response', rawText);
        return {
          success: false,
          errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
          rawResponse: rawText,
        };
      }

      const data = sanitizeAIExtractionData(parsed);
      if (Object.keys(data).length === 0) {
        console.warn('[Smart Assist][Gemini] No usable fields in response', rawText);
        return {
          success: false,
          errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
          rawResponse: rawText,
        };
      }

      return {
        success: true,
        data,
        rawResponse: rawText,
      };
    } catch (error) {
      const detail =
        error instanceof HttpErrorResponse
          ? error.error?.error?.message || `HTTP ${error.status}`
          : error instanceof Error
            ? error.message
            : 'Unknown error';

      console.error('[Smart Assist][Gemini] Request failed:', detail, error);

      if (error instanceof HttpErrorResponse && error.status === 429) {
        return {
          success: false,
          errorMessage:
            'Gemini quota was exceeded for the configured model. Try again later, or switch geminiModel in environment.development.ts (for example gemini-flash-latest).',
        };
      }

      return {
        success: false,
        errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
      };
    }
  }
}
