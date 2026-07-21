import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { FormSchema } from '../../../../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../../../../schemas/bundled/account-opening.schema';
import { SmartAssistPatchRequest } from '../../models/document-extraction.model';
import { AIExtractionService } from '../../services/ai-extraction.service';
import { DocumentExtractionService } from '../../services/document-extraction.service';
import { FieldMappingService } from '../../services/field-mapping.service';
import { createPdfFile } from '../../testing/pdf-test.helpers';

import { SmartAssistPanel } from './smart-assist-panel';

describe('SmartAssistPanel AI workflow', () => {
  let fixture: ComponentFixture<SmartAssistPanel>;
  let component: SmartAssistPanel;
  let documentExtraction: jasmine.SpyObj<DocumentExtractionService>;
  let aiExtraction: jasmine.SpyObj<AIExtractionService>;

  beforeEach(async () => {
    documentExtraction = jasmine.createSpyObj('DocumentExtractionService', ['extractTextFromDocument']);
    aiExtraction = jasmine.createSpyObj('AIExtractionService', ['extractStructuredFields']);

    await TestBed.configureTestingModule({
      imports: [SmartAssistPanel],
      providers: [
        FieldMappingService,
        provideNoopAnimations(),
        { provide: DocumentExtractionService, useValue: documentExtraction },
        { provide: AIExtractionService, useValue: aiExtraction },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SmartAssistPanel);
    component = fixture.componentInstance;
  });

  function initWithSchema(schema: FormSchema): void {
    fixture.componentRef.setInput('schema', schema);
    fixture.detectChanges();
  }

  it('should display the upload section on every form', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    const panel = fixture.nativeElement as HTMLElement;
    expect(panel.querySelector('.smart-assist-panel')).toBeTruthy();
    expect(panel.textContent).toContain('Need help filling the form?');
    expect(panel.textContent).toContain('Upload Document');
    expect(panel.textContent).toContain('Continue filling manually');
  });

  it('should allow manual form filling without uploading a document', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeTruthy();
    expect(aiExtraction.extractStructuredFields).not.toHaveBeenCalled();
  });

  it('Successful AI extraction patches mapped values', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: true,
      text: 'Name Ananya Tayi Email ananya@example.com',
    });
    aiExtraction.extractStructuredFields.and.resolveTo({
      success: true,
      data: {
        fullName: 'Ananya Tayi',
        email: 'ananya@example.com',
        accountType: 'Current',
      },
    });

    const emitted: SmartAssistPatchRequest[] = [];
    component.valuesReady.subscribe((request) => emitted.push(request));

    await (
      component as unknown as { onFileSelected: (file: File) => Promise<void> }
    ).onFileSelected(createPdfFile('doc.pdf', ['ignored by spy']));
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0].values['fullName']).toBe('Ananya Tayi');
    expect(emitted[0].values['email']).toBe('ananya@example.com');
    expect(emitted[0].values['accountType']).toBe('current');
  });

  it('Empty AI response keeps the form usable', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: true,
      text: 'bank statement text',
    });
    aiExtraction.extractStructuredFields.and.resolveTo({
      success: true,
      data: {},
    });

    const emitted: SmartAssistPatchRequest[] = [];
    component.valuesReady.subscribe((request) => emitted.push(request));

    await (
      component as unknown as { onFileSelected: (file: File) => Promise<void> }
    ).onFileSelected(createPdfFile('empty.pdf', ['x']));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.debugElement.query(By.css('.smart-assist-error'))).toBeTruthy();
  });

  it('Invalid JSON / AI failure does not break the form', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: true,
      text: 'document text',
    });
    aiExtraction.extractStructuredFields.and.resolveTo({
      success: false,
      errorMessage: 'Unable to analyse the document automatically. Please continue filling the form manually.',
    });

    await (
      component as unknown as { onFileSelected: (file: File) => Promise<void> }
    ).onFileSelected(createPdfFile('bad.pdf', ['x']));
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('.smart-assist-error'));
    expect(message.nativeElement.textContent).toContain('Unable to analyse the document automatically');
    expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeTruthy();
  });

  it('should show a friendly parsing failure message', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: false,
      errorMessage:
        'This document could not be read because it contains scanned images. Please upload a searchable PDF or continue filling the form manually.',
    });

    await (
      component as unknown as { onFileSelected: (file: File) => Promise<void> }
    ).onFileSelected(new File([new Uint8Array([0xff])], 'scan.jpg', { type: 'image/jpeg' }));
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent?.toLowerCase()).not.toContain('ocr');
    expect(html.textContent).toContain('scanned images');
  });
});
