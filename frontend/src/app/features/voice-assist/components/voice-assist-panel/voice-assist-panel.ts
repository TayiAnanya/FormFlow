import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';

import { FormSchema } from '../../../../models/form-schema.model';
import {
  MappedFormValues,
  SmartAssistPatchRequest,
} from '../../../smart-assist/models/document-extraction.model';
import { AIExtractionService } from '../../../smart-assist/services/ai-extraction.service';
import { FieldMappingService } from '../../../smart-assist/services/field-mapping.service';
import { hasExistingUserValue } from '../../../smart-assist/utils/form-patch.util';
import {
  FieldConfidenceIndicator,
  VoiceReportInsights,
  buildVoiceReportInsights,
} from '../../utils/voice-report-insights.util';
import { VoiceInputComponent } from '../voice-input/voice-input.component';

export type VoiceAssistPhase =
  | 'ready'
  | 'listening'
  | 'transcript'
  | 'analyzing'
  | 'populated'
  | 'error';

/**
 * Support Center enhancement: voice → AI extraction → form patch.
 * Reuses AIExtractionService; does not alter DynamicFormRenderer.
 */
@Component({
  selector: 'app-voice-assist-panel',
  standalone: true,
  imports: [Button, Message, VoiceInputComponent],
  templateUrl: './voice-assist-panel.html',
  styleUrl: './voice-assist-panel.css',
})
export class VoiceAssistPanel {
  private readonly aiExtraction = inject(AIExtractionService);
  private readonly mappingService = inject(FieldMappingService);

  @Input({ required: true }) schema!: FormSchema;
  @Input() currentFormValues: Record<string, unknown> = {};

  @Input() panelTitle = 'AI Assisted Fraud Reporting';
  @Input() panelDescription =
    'Press Start Recording, describe the fraud in your own words, then press Stop Recording when finished. We will analyse the full transcript and fill the form. You can still edit every field manually.';

  @Output() readonly valuesReady = new EventEmitter<SmartAssistPatchRequest>();

  protected phase: VoiceAssistPhase = 'ready';
  protected transcriptPreview: string | null = null;
  protected statusMessage: string | null = null;
  protected errorMessage: string | null = null;
  protected pendingMappedValues: MappedFormValues | null = null;
  protected conflictFieldKeys: string[] = [];
  protected insights: VoiceReportInsights | null = null;
  protected lastSpeechConfidence: number | null = null;

  protected onListeningChange(listening: boolean): void {
    if (listening) {
      this.phase = 'listening';
      this.errorMessage = null;
      this.statusMessage = null;
      this.insights = null;
      this.transcriptPreview = null;
      this.pendingMappedValues = null;
      this.conflictFieldKeys = [];
    } else if (this.phase === 'listening' && !this.transcriptPreview) {
      this.phase = 'ready';
    }
  }

  protected onSpeechConfidence(confidence: number | null): void {
    this.lastSpeechConfidence = confidence;
  }

  protected async onTranscript(transcript: string): Promise<void> {
    const text = transcript.trim();
    if (!text) {
      return;
    }

    this.transcriptPreview = text;
    this.phase = 'transcript';
    this.errorMessage = null;
    this.statusMessage = null;
    this.pendingMappedValues = null;
    this.conflictFieldKeys = [];
    this.insights = null;

    await this.analyzeTranscript(text);
  }

  protected onRecognitionError(message: string): void {
    this.errorMessage = message;
    this.phase = 'error';
    this.statusMessage = null;
  }

  protected clearTranscript(): void {
    this.transcriptPreview = null;
    this.statusMessage = null;
    this.errorMessage = null;
    this.pendingMappedValues = null;
    this.conflictFieldKeys = [];
    this.insights = null;
    this.lastSpeechConfidence = null;
    this.phase = 'ready';
  }

  protected applyToEmptyFieldsOnly(): void {
    if (!this.pendingMappedValues) {
      return;
    }

    this.emitPatch(this.pendingMappedValues, false);
    this.completePopulation(this.pendingMappedValues);
  }

  protected replaceExistingValues(): void {
    if (!this.pendingMappedValues) {
      return;
    }

    this.emitPatch(this.pendingMappedValues, true);
    this.completePopulation(this.pendingMappedValues);
  }

  protected confidencePercent(value: number): number {
    return Math.round(value * 100);
  }

  protected confidenceLabel(level: FieldConfidenceIndicator['level']): string {
    switch (level) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      default:
        return 'Low';
    }
  }

  private async analyzeTranscript(transcript: string): Promise<void> {
    this.phase = 'analyzing';
    this.statusMessage = 'Analyzing your report…';

    try {
      const result = await this.aiExtraction.extractStructuredFields(this.schema, transcript);

      if (!result.success || !result.data) {
        this.phase = 'error';
        this.errorMessage =
          result.errorMessage ??
          'Unable to extract fraud details from your speech. Please try again or fill the form manually.';
        this.statusMessage = null;
        return;
      }

      const mapped = this.mappingService.mapToSchemaFields(this.schema, result.data);
      const mappedKeys = Object.keys(mapped);

      if (mappedKeys.length === 0) {
        this.phase = 'error';
        this.errorMessage =
          'Unable to match spoken details to the form. Please try again or fill the form manually.';
        this.statusMessage = null;
        return;
      }

      this.conflictFieldKeys = mappedKeys.filter((key) =>
        hasExistingUserValue(this.currentFormValues[key]),
      );

      if (this.conflictFieldKeys.length > 0) {
        this.pendingMappedValues = mapped;
        this.insights = buildVoiceReportInsights(
          this.schema,
          mapped,
          transcript,
          this.lastSpeechConfidence,
        );
        this.phase = 'transcript';
        this.statusMessage = `Extracted details are ready. ${this.conflictFieldKeys.length} field(s) already contain values.`;
        return;
      }

      this.emitPatch(mapped, false);
      this.completePopulation(mapped);
    } catch {
      this.phase = 'error';
      this.errorMessage =
        'Unable to extract fraud details from your speech. Please try again or fill the form manually.';
      this.statusMessage = null;
    }
  }

  private completePopulation(mapped: MappedFormValues): void {
    this.insights = buildVoiceReportInsights(
      this.schema,
      mapped,
      this.transcriptPreview ?? '',
      this.lastSpeechConfidence,
    );
    this.phase = 'populated';
    this.statusMessage = 'Form populated successfully';
    this.pendingMappedValues = null;
    this.conflictFieldKeys = [];
  }

  private emitPatch(values: MappedFormValues, overwriteExisting: boolean): void {
    this.valuesReady.emit({ values, overwriteExisting });
  }
}
