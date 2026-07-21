import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { FormSchema } from '../../../../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../../../../schemas/bundled/account-opening.schema';
import { SmartAssistPatchRequest } from '../../models/document-extraction.model';
import { DocumentExtractionService } from '../../services/document-extraction.service';
import { FieldMappingService } from '../../services/field-mapping.service';
import { createPdfFile } from '../../testing/pdf-test.helpers';

import { SmartAssistPanel } from './smart-assist-panel';

describe('SmartAssistPanel label extraction workflow', () => {
  let fixture: ComponentFixture<SmartAssistPanel>;
  let component: SmartAssistPanel;
  let documentExtraction: jasmine.SpyObj<DocumentExtractionService>;

  beforeEach(async () => {
    documentExtraction = jasmine.createSpyObj('DocumentExtractionService', ['extractTextFromDocument']);

    await TestBed.configureTestingModule({
      imports: [SmartAssistPanel],
      providers: [
        FieldMappingService,
        provideNoopAnimations(),
        { provide: DocumentExtractionService, useValue: documentExtraction },
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
    expect(documentExtraction.extractTextFromDocument).not.toHaveBeenCalled();
  });

  it('Successful label-based extraction patches mapped values', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: true,
      text: `
        Full Name
        Tayi Ananya
        Email Address
        ananyatayi14@gmail.com
        Date of Birth
        12 May 2004
        Account Type
        Current
      `,
    });

    const emitted: SmartAssistPatchRequest[] = [];
    component.valuesReady.subscribe((request) => emitted.push(request));

    await (
      component as unknown as { onFileSelected: (file: File) => Promise<void> }
    ).onFileSelected(createPdfFile('doc.pdf', ['ignored by spy']));
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0].values['fullName']).toBe('Tayi Ananya');
    expect(emitted[0].values['email']).toBe('ananyatayi14@gmail.com');
    expect(emitted[0].values['dateOfBirth']).toBe('12 May 2004');
    expect(emitted[0].values['accountType']).toBe('current');
  });

  it('Missing labels keep the form usable', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: true,
      text: 'bank statement text without form labels',
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

  it('PDF extraction failure does not break the form', async () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    documentExtraction.extractTextFromDocument.and.resolveTo({
      success: false,
      errorMessage: 'Unable to read document text.',
    });

    const emitted: SmartAssistPatchRequest[] = [];
    component.valuesReady.subscribe((request) => emitted.push(request));

    await (
      component as unknown as { onFileSelected: (file: File) => Promise<void> }
    ).onFileSelected(createPdfFile('bad.pdf', ['x']));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.debugElement.query(By.css('.smart-assist-error'))).toBeTruthy();
  });
});
