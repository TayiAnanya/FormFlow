import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { SchemaLoaderService } from '../../../../services/schema-loader.service';
import { CUSTOMER_SUPPORT_SCHEMA } from '../../../../schemas/bundled/customer-support.schema';
import { DynamicFormRenderer } from '../../../renderer/dynamic-form-renderer/dynamic-form-renderer';
import { SmartAssistPatchRequest } from '../../../smart-assist/models/document-extraction.model';
import { AIExtractionService } from '../../../smart-assist/services/ai-extraction.service';
import { FieldMappingService } from '../../../smart-assist/services/field-mapping.service';
import { SpeechRecognitionError } from '../../models/speech-recognition.model';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { VoiceAssistPanel } from './voice-assist-panel';

describe('VoiceAssistPanel', () => {
  let fixture: ComponentFixture<VoiceAssistPanel>;
  let component: VoiceAssistPanel;
  let aiExtraction: jasmine.SpyObj<AIExtractionService>;
  let speech: {
    listening$: Subject<boolean>;
    transcript$: Subject<string>;
    liveTranscript$: BehaviorSubject<string>;
    interimTranscript$: Subject<string>;
    error$: Subject<SpeechRecognitionError>;
    isSupported: jasmine.Spy;
    isListening: jasmine.Spy;
    getAverageConfidence: jasmine.Spy;
    start: jasmine.Spy;
    stop: jasmine.Spy;
    abort: jasmine.Spy;
  };

  const sampleTranscript =
    'My debit card ending 4521 was used yesterday at Amazon for 2500 rupees.';

  const sampleAiData = {
    supportRequestType: 'report_fraud',
    fraudType: 'card_fraud',
    fraudCardLast4: '4521',
    fraudMerchant: 'Amazon',
    fraudAmount: '2500',
    issueDescription: 'Unauthorized Amazon transaction',
  };

  beforeEach(async () => {
    aiExtraction = jasmine.createSpyObj('AIExtractionService', ['extractStructuredFields']);
    speech = {
      listening$: new Subject<boolean>(),
      transcript$: new Subject<string>(),
      liveTranscript$: new BehaviorSubject<string>(''),
      interimTranscript$: new Subject<string>(),
      error$: new Subject<SpeechRecognitionError>(),
      isSupported: jasmine.createSpy('isSupported').and.returnValue(true),
      isListening: jasmine.createSpy('isListening').and.returnValue(false),
      getAverageConfidence: jasmine.createSpy('getAverageConfidence').and.returnValue(0.88),
      start: jasmine.createSpy('start'),
      stop: jasmine.createSpy('stop'),
      abort: jasmine.createSpy('abort'),
    };

    await TestBed.configureTestingModule({
      imports: [VoiceAssistPanel, DynamicFormRenderer, ReactiveFormsModule],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        SchemaLoaderService,
        FieldMappingService,
        { provide: AIExtractionService, useValue: aiExtraction },
        { provide: SpeechRecognitionService, useValue: speech },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceAssistPanel);
    component = fixture.componentInstance;
    component.schema = CUSTOMER_SUPPORT_SCHEMA;
    component.currentFormValues = {};
    fixture.detectChanges();
  });

  async function runTranscript(text = sampleTranscript): Promise<SmartAssistPatchRequest[]> {
    const emitted: SmartAssistPatchRequest[] = [];
    component.valuesReady.subscribe((request) => emitted.push(request));

    await (
      component as unknown as { onTranscript: (t: string) => Promise<void> }
    ).onTranscript(text);

    fixture.detectChanges();
    return emitted;
  }

  it('Form populated — AI extraction result is emitted for patchValue', async () => {
    aiExtraction.extractStructuredFields.and.resolveTo({
      success: true,
      data: sampleAiData,
    });

    const emitted = await runTranscript();

    expect(aiExtraction.extractStructuredFields).toHaveBeenCalledWith(
      CUSTOMER_SUPPORT_SCHEMA,
      sampleTranscript,
    );
    expect(emitted.length).toBe(1);
    expect(emitted[0].values['supportRequestType']).toBe('report_fraud');
    expect(emitted[0].values['fraudCardLast4']).toBe('4521');
    expect(emitted[0].values['fraudMerchant']).toBe('Amazon');
    expect(emitted[0].values['fraudAmount']).toBe('2500');
    expect((component as unknown as { phase: string }).phase).toBe('populated');
    expect((component as unknown as { statusMessage: string }).statusMessage).toBe(
      'Form populated successfully',
    );
    expect((component as unknown as { insights: { summary: string } | null }).insights?.summary).toContain(
      'fraud',
    );
  });

  it('AI extraction failure — shows friendly error and does not emit patch', async () => {
    aiExtraction.extractStructuredFields.and.resolveTo({
      success: false,
      errorMessage: 'AI extraction failed',
    });

    const emitted = await runTranscript();

    expect(emitted.length).toBe(0);
    expect((component as unknown as { phase: string }).phase).toBe('error');
    expect((component as unknown as { errorMessage: string }).errorMessage).toContain(
      'AI extraction failed',
    );
  });

  it('Transcript preview is shown before analysis completes', async () => {
    let resolveExtraction!: (value: {
      success: boolean;
      data?: Record<string, unknown>;
    }) => void;
    aiExtraction.extractStructuredFields.and.returnValue(
      new Promise((resolve) => {
        resolveExtraction = resolve;
      }),
    );

    const pending = (
      component as unknown as { onTranscript: (t: string) => Promise<void> }
    ).onTranscript(sampleTranscript);

    fixture.detectChanges();
    expect((component as unknown as { transcriptPreview: string }).transcriptPreview).toBe(
      sampleTranscript,
    );
    expect((component as unknown as { phase: string }).phase).toBe('analyzing');

    resolveExtraction({ success: true, data: sampleAiData });
    await pending;
  });

  it('Manual editing — patched fraud values remain editable on the renderer', async () => {
    aiExtraction.extractStructuredFields.and.resolveTo({
      success: true,
      data: sampleAiData,
    });

    const rendererFixture = TestBed.createComponent(DynamicFormRenderer);
    rendererFixture.componentRef.setInput('schema', CUSTOMER_SUPPORT_SCHEMA);
    rendererFixture.detectChanges();

    const renderer = rendererFixture.componentInstance as unknown as {
      form: {
        get: (k: string) => {
          value: unknown;
          enabled: boolean;
          setValue: (v: unknown) => void;
        } | null;
      };
      patchFormValues: (
        values: Record<string, unknown>,
        options?: { overwriteExisting?: boolean },
      ) => void;
    };

    const emitted = await runTranscript();
    renderer.patchFormValues(emitted[0].values, { overwriteExisting: true });
    rendererFixture.detectChanges();

    expect(renderer.form.get('supportRequestType')?.value).toBe('report_fraud');
    expect(renderer.form.get('fraudCardLast4')?.enabled).toBeTrue();

    renderer.form.get('fraudMerchant')?.setValue('Amazon India');
    expect(renderer.form.get('fraudMerchant')?.value).toBe('Amazon India');
  });
});
