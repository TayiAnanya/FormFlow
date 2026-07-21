import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import {
  BrowserSpeechRecognition,
  SPEECH_NO_SPEECH_MESSAGE,
  SPEECH_PERMISSION_DENIED_MESSAGE,
  SPEECH_UNSUPPORTED_MESSAGE,
} from '../models/speech-recognition.model';
import { SpeechRecognitionService } from './speech-recognition.service';

class FakeSpeechRecognition implements BrowserSpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onstart: ((event: Event) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onresult: ((event: Event) => void) | null = null;

  start = jasmine.createSpy('start').and.callFake(() => {
    this.onstart?.(new Event('start'));
  });

  stop = jasmine.createSpy('stop').and.callFake(() => {
    this.onend?.(new Event('end'));
  });

  abort = jasmine.createSpy('abort').and.callFake(() => {
    this.onend?.(new Event('end'));
  });

  emitResult(transcript: string, isFinal = true, confidence = 0.92): void {
    const event = {
      results: [
        {
          0: { transcript, confidence },
          isFinal,
          length: 1,
        },
      ],
      resultIndex: 0,
    } as unknown as Event;
    this.onresult?.(event);
  }

  emitError(error: string): void {
    const event = { error } as unknown as Event;
    this.onerror?.(event);
  }
}

describe('SpeechRecognitionService', () => {
  let service: SpeechRecognitionService;
  let fake: FakeSpeechRecognition;
  let originalSpeechRecognition: unknown;
  let originalWebkit: unknown;

  beforeEach(() => {
    fake = new FakeSpeechRecognition();
    originalSpeechRecognition = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    originalWebkit = (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = function SpeechRecognition() {
      return fake;
    };
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    TestBed.configureTestingModule({
      providers: [SpeechRecognitionService],
    });
    service = TestBed.inject(SpeechRecognitionService);
  });

  afterEach(() => {
    service.abort();
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    if (originalSpeechRecognition === undefined) {
      delete win.SpeechRecognition;
    } else {
      win.SpeechRecognition = originalSpeechRecognition;
    }
    if (originalWebkit === undefined) {
      delete win.webkitSpeechRecognition;
    } else {
      win.webkitSpeechRecognition = originalWebkit;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('reports supported when SpeechRecognition is available', () => {
    expect(service.isSupported()).toBeTrue();
  });

  it('Unsupported browser — isSupported is false when API is missing', () => {
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    expect(service.isSupported()).toBeFalse();
  });

  it('Start recording — starts recognition and emits listening true', () => {
    service.start({ lang: 'en-IN' });

    expect(fake.start).toHaveBeenCalled();
    expect(fake.lang).toBe('en-IN');
    expect(fake.continuous).toBeTrue();
    expect(service.isListening()).toBeTrue();
  });

  it('Stop recording — stops recognition and emits listening false', () => {
    service.start();
    expect(service.isListening()).toBeTrue();

    service.stop();

    expect(fake.stop).toHaveBeenCalled();
    expect(service.isListening()).toBeFalse();
  });

  it('does not emit transcript for partial speech until Stop', async () => {
    const emitted: string[] = [];
    service.transcript$.subscribe((value) => emitted.push(value));

    service.start();
    fake.emitResult('My debit card ending 4521', true);
    fake.emitResult('was used at Amazon', true);

    expect(emitted).toEqual([]);

    const transcriptPromise = firstValueFrom(service.transcript$);
    service.stop();

    await expectAsync(transcriptPromise).toBeResolvedTo(
      'My debit card ending 4521 was used at Amazon',
    );
    expect(emitted).toEqual(['My debit card ending 4521 was used at Amazon']);
  });

  it('No speech detected — emits friendly error when Stop is pressed with empty transcript', async () => {
    const errorPromise = firstValueFrom(service.error$);
    service.start();
    service.stop();

    const error = await errorPromise;
    expect(error.code).toBe('no-speech');
    expect(error.message).toBe(SPEECH_NO_SPEECH_MESSAGE);
  });

  it('Permission denied — maps not-allowed to a friendly error', async () => {
    const errorPromise = firstValueFrom(service.error$);
    service.start();
    fake.emitError('not-allowed');

    const error = await errorPromise;
    expect(error.code).toBe('not-allowed');
    expect(error.message).toBe(SPEECH_PERMISSION_DENIED_MESSAGE);
    expect(service.isListening()).toBeFalse();
  });

  it('Unsupported browser — start emits unsupported error without throwing', async () => {
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    const errorPromise = firstValueFrom(service.error$);

    service.start();

    const error = await errorPromise;
    expect(error.code).toBe('unsupported');
    expect(error.message).toBe(SPEECH_UNSUPPORTED_MESSAGE);
    expect(service.isListening()).toBeFalse();
  });
});
