/**
 * AI-ready document parser extension point.
 * Prefer AIExtractionService + DocumentExtractionService for the new workflow.
 * Kept as a naming alias for earlier architecture notes.
 */
export {
  DocumentExtractionService as DocumentParserService,
} from './document-extraction.service';
