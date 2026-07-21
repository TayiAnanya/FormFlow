import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';

import { FormSchema } from '../../../../models/form-schema.model';
import {
  MappedFormValues,
  SmartAssistPatchRequest,
} from '../../models/document-extraction.model';
import { DocumentExtractionService } from '../../services/document-extraction.service';
import { FieldMappingService } from '../../services/field-mapping.service';
import { extractFieldsBySchemaLabels } from '../../utils/document-field.parser';
import { hasExistingUserValue } from '../../utils/form-patch.util';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';

const DEFAULT_SUPPORTED_DOCUMENTS = [
  'Aadhaar',
  'PAN Card',
  'Passport',
  'Driving Licence',
  'Salary Slip',
  'GST Certificate',
  'Bank Statement',
];

@Component({
  selector: 'app-smart-assist-panel',
  standalone: true,
  imports: [Message, Button, DocumentUploadComponent],
  templateUrl: './smart-assist-panel.html',
  styleUrl: './smart-assist-panel.css',
})
export class SmartAssistPanel {
  private readonly documentExtraction = inject(DocumentExtractionService);
  private readonly mappingService = inject(FieldMappingService);

  @ViewChild(DocumentUploadComponent) private documentUpload?: DocumentUploadComponent;

  @Input({ required: true }) schema!: FormSchema;

  /** Current form values used to detect overwrite conflicts before patching. */
  @Input() currentFormValues: Record<string, unknown> = {};

  /** Optional presentation overrides for scenario-specific Assist panels. */
  @Input() panelTitle = 'AI Smart Assist';
  @Input() panelDescription =
    'Upload a searchable PDF to automatically populate your details. Manual entry remains fully supported.';
  @Input() supportedDocuments: string[] = DEFAULT_SUPPORTED_DOCUMENTS;

  @Output() readonly valuesReady = new EventEmitter<SmartAssistPatchRequest>();

  protected statusMessage: string | null = null;
  protected errorMessage: string | null = null;
  protected pendingMappedValues: MappedFormValues | null = null;
  protected conflictFieldKeys: string[] = [];

  protected async onFileSelected(file: File): Promise<void> {
    this.errorMessage = null;
    this.statusMessage = null;
    this.pendingMappedValues = null;
    this.conflictFieldKeys = [];
    this.documentUpload?.setBusy(true);

    try {
      // 1) Extract searchable text from the uploaded PDF.
      const textResult = await this.documentExtraction.extractTextFromDocument(file);
      if (!textResult.success || !textResult.text) {
        console.warn('[Smart Assist] PDF text extraction failed:', textResult.errorMessage);
        this.errorMessage =
          textResult.errorMessage ??
          'Unable to analyse the document automatically. Please continue filling the form manually.';
        return;
      }

      console.log('[Smart Assist] PDF text extracted, length:', textResult.text.length);
      console.log('[Smart Assist] Active schema:', this.schema.id);

      // 2) Load active schema and search document text using each field's label.
      const extracted = extractFieldsBySchemaLabels(this.schema, textResult.text, { debug: true });
      console.log('[Smart Assist] Label-based extraction result:', extracted);

      // 3) Schema-safe option coercion (dropdown / multiselect label → value) + Mapped to logs.
      const mapped = this.mappingService.mapToSchemaFields(this.schema, extracted);
      const mappedKeys = Object.keys(mapped);

      if (mappedKeys.length === 0) {
        console.warn('[Smart Assist] No schema labels found in document text');
        this.errorMessage =
          'Unable to recognise form fields in this document. Please continue filling the form manually.';
        return;
      }

      console.log('[Smart Assist] Patching form fields:', mapped);

      this.conflictFieldKeys = mappedKeys.filter((key) =>
        hasExistingUserValue(this.currentFormValues[key]),
      );

      if (this.conflictFieldKeys.length > 0) {
        this.pendingMappedValues = mapped;
        this.statusMessage = `Extracted details are ready. ${this.conflictFieldKeys.length} field(s) already contain values.`;
        return;
      }

      this.emitPatch(mapped, false);
      this.statusMessage = `Populated ${mappedKeys.length} field(s) from document labels. Please review before submitting.`;
    } catch {
      this.errorMessage =
        'Unable to analyse the document automatically. Please continue filling the form manually.';
    } finally {
      this.documentUpload?.setBusy(false);
    }
  }

  protected applyToEmptyFieldsOnly(): void {
    if (!this.pendingMappedValues) {
      return;
    }

    this.emitPatch(this.pendingMappedValues, false);
    this.statusMessage = 'Applied extracted values to empty fields. Please review before submitting.';
    this.pendingMappedValues = null;
    this.conflictFieldKeys = [];
  }

  protected replaceExistingValues(): void {
    if (!this.pendingMappedValues) {
      return;
    }

    this.emitPatch(this.pendingMappedValues, true);
    this.statusMessage = 'Replaced matching fields with extracted values. Please review before submitting.';
    this.pendingMappedValues = null;
    this.conflictFieldKeys = [];
  }

  private emitPatch(values: MappedFormValues, overwriteExisting: boolean): void {
    this.valuesReady.emit({ values, overwriteExisting });
  }
}
