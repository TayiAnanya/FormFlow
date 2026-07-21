import { Injectable } from '@angular/core';

import {
  isSupportedDocumentFile,
  readDocumentText,
  UNSCANNABLE_DOCUMENT_MESSAGE,
  UNSUPPORTED_FILE_MESSAGE,
} from '../utils/document-text.reader';

/** Result of frontend PDF text extraction (pdf.js / content streams). */
export interface DocumentTextExtractionResult {
  success: boolean;
  text?: string;
  errorMessage?: string;
}

/**
 * Extracts searchable text from uploaded documents.
 * Does NOT map fields — that intelligence belongs to AIExtractionService.
 */
@Injectable({ providedIn: 'root' })
export class DocumentExtractionService {
  /**
   * Reads available text from a searchable PDF (or fails friendly for scans/images).
   */
  async extractTextFromDocument(file: File): Promise<DocumentTextExtractionResult> {
    if (!isSupportedDocumentFile(file)) {
      return {
        success: false,
        errorMessage: UNSUPPORTED_FILE_MESSAGE,
      };
    }

    if (file.size === 0) {
      return {
        success: false,
        errorMessage: UNSCANNABLE_DOCUMENT_MESSAGE,
      };
    }

    const readResult = await readDocumentText(file);
    const text = readResult.text.trim();

    if (!text) {
      return {
        success: false,
        errorMessage: readResult.warning ?? UNSCANNABLE_DOCUMENT_MESSAGE,
      };
    }

    console.log('[Smart Assist] Extracted PDF text length:', text.length);
    return {
      success: true,
      text,
    };
  }
}
