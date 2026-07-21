import { TestBed } from '@angular/core/testing';

import { createPdfFile } from '../testing/pdf-test.helpers';
import { DocumentExtractionService } from './document-extraction.service';

describe('DocumentExtractionService', () => {
  let service: DocumentExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentExtractionService],
    });
    service = TestBed.inject(DocumentExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extracts searchable text from uploaded PDF contents', async () => {
    const file = createPdfFile('aadhaar.pdf', [
      'Full Name',
      'Tayi Ananya',
      'Email Address',
      'ananya@example.com',
    ]);

    const result = await service.extractTextFromDocument(file);

    expect(result.success).toBeTrue();
    expect(result.text).toContain('Tayi Ananya');
    expect(result.text).toContain('ananya@example.com');
  });

  it('produces different text for different uploaded PDFs', async () => {
    const first = createPdfFile('a.pdf', ['Name', 'Priya Sharma']);
    const second = createPdfFile('b.pdf', ['Name', 'Vikram Mehta']);

    const firstResult = await service.extractTextFromDocument(first);
    const secondResult = await service.extractTextFromDocument(second);

    expect(firstResult.text).toContain('Priya Sharma');
    expect(secondResult.text).toContain('Vikram Mehta');
    expect(firstResult.text).not.toEqual(secondResult.text);
  });

  it('should display extraction failure message for unsupported files', async () => {
    const file = new File(['notes'], 'notes.txt', { type: 'text/plain' });
    const result = await service.extractTextFromDocument(file);

    expect(result.success).toBeFalse();
    expect(result.errorMessage).toContain('searchable PDF');
  });

  it('shows a friendly message for image uploads without mentioning OCR', async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'scan.jpg', { type: 'image/jpeg' });
    const result = await service.extractTextFromDocument(file);

    expect(result.success).toBeFalse();
    expect(result.errorMessage).toContain('scanned images');
    expect(result.errorMessage?.toLowerCase()).not.toContain('ocr');
  });
});
