/**
 * Lightweight frontend document text reader for AI Smart Assist.
 * Supports searchable (text-based) PDFs via content-stream parsing and pdf.js.
 * Image uploads and scanned PDFs without extractable text return a friendly message.
 */

export interface DocumentTextReadResult {
  text: string;
  source: 'pdf' | 'image' | 'unsupported';
  warning?: string;
}

/** Friendly message for documents that cannot be read as searchable text. */
export const UNSCANNABLE_DOCUMENT_MESSAGE =
  'This document could not be read because it contains scanned images. Please upload a searchable PDF or continue filling the form manually.';

export const UNSUPPORTED_FILE_MESSAGE =
  'Please upload a searchable PDF, or continue filling the form manually.';

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function isSupportedDocumentFile(file: File): boolean {
  return SUPPORTED_EXTENSIONS.has(getFileExtension(file.name));
}

/**
 * Lightweight PDF text extraction for searchable PDFs.
 * Reads literal strings from content streams — no invented values.
 */
export function extractTextFromPdfBytes(data: ArrayBuffer): string {
  const raw = new TextDecoder('latin1').decode(data);
  const lines: string[] = [];
  const literalString = /\(((?:\\.|[^\\)])*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = literalString.exec(raw)) !== null) {
    const decoded = decodePdfLiteral(match[1]).trim();
    if (!decoded || !/[A-Za-z0-9@]/.test(decoded)) {
      continue;
    }

    // Skip common PDF metadata / font internals that are not document content.
    if (/^(Helvetica|Times|Courier|Identity|Adobe|PDF)/i.test(decoded)) {
      continue;
    }

    lines.push(decoded);
  }

  return lines.join('\n');
}

function decodePdfLiteral(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

/** Extracts text from searchable PDFs using pdf.js when stream parsing is insufficient. */
async function extractTextWithPdfJs(data: ArrayBuffer): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.toString();

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(data),
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? String(item.str) : ''))
        .filter((part) => part.trim().length > 0)
        .join('\n');
      if (pageText.trim()) {
        pages.push(pageText);
      }
    }

    return pages.join('\n');
  } catch {
    return '';
  }
}

/**
 * Extracts available text from an uploaded document in the browser.
 * Does not invent content and does not call external services.
 */
export async function readDocumentText(file: File): Promise<DocumentTextReadResult> {
  const extension = getFileExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return {
      text: '',
      source: 'unsupported',
      warning: UNSUPPORTED_FILE_MESSAGE,
    };
  }

  if (file.size === 0) {
    return {
      text: '',
      source: extension === 'pdf' ? 'pdf' : 'image',
      warning: UNSCANNABLE_DOCUMENT_MESSAGE,
    };
  }

  if (extension === 'pdf') {
    const buffer = await file.arrayBuffer();
    const streamText = extractTextFromPdfBytes(buffer).trim();

    // Prefer fast stream parsing when text is already available. Fall back to pdf.js for complex PDFs.
    const text = streamText || (await extractTextWithPdfJs(buffer)).trim();

    return {
      text,
      source: 'pdf',
      warning: text ? undefined : UNSCANNABLE_DOCUMENT_MESSAGE,
    };
  }

  // Image files cannot be parsed as searchable text in this frontend prototype.
  return {
    text: '',
    source: 'image',
    warning: UNSCANNABLE_DOCUMENT_MESSAGE,
  };
}
