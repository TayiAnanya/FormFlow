import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';

import {
  SPEECH_NO_SPEECH_MESSAGE,
  SPEECH_PERMISSION_DENIED_MESSAGE,
  SPEECH_UNSUPPORTED_MESSAGE,
  SpeechRecognitionError,
} from '../../models/speech-recognition.model';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { VoiceInputComponent } from './voice-input.component';

describe('VoiceInputComponent', () => {
  let fixture: ComponentFixture<VoiceInputComponent>;
  let component: VoiceInputComponent;
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

  function createSpeechSpy(supported: boolean): typeof speech {
    return {
      listening$: new Subject<boolean>(),
      transcript$: new Subject<string>(),
      liveTranscript$: new BehaviorSubject<string>(''),
      interimTranscript$: new Subject<string>(),
      error$: new Subject<SpeechRecognitionError>(),
      isSupported: jasmine.createSpy('isSupported').and.returnValue(supported),
      isListening: jasmine.createSpy('isListening').and.returnValue(false),
      getAverageConfidence: jasmine.createSpy('getAverageConfidence').and.returnValue(0.9),
      start: jasmine.createSpy('start'),
      stop: jasmine.createSpy('stop'),
      abort: jasmine.createSpy('abort'),
    };
  }

  async function setup(supported = true): Promise<void> {
    speech = createSpeechSpy(supported);

    await TestBed.configureTestingModule({
      imports: [VoiceInputComponent],
      providers: [
        provideNoopAnimations(),
        { provide: SpeechRecognitionService, useValue: speech },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('Start recording — calls speech.start with continuous mode', async () => {
    await setup(true);
    const harness = component as unknown as { startRecording: () => void };

    harness.startRecording();

    expect(speech.start).toHaveBeenCalledWith(
      jasmine.objectContaining({ continuous: true, interimResults: true }),
    );
  });

  it('Stop recording — calls speech.stop while listening', async () => {
    await setup(true);
    speech.listening$.next(true);
    fixture.detectChanges();

    const harness = component as unknown as { stopRecording: () => void; isListening: boolean };
    expect(harness.isListening).toBeTrue();
    harness.stopRecording();

    expect(speech.stop).toHaveBeenCalled();
  });

  it('shows Stop Recording button while listening', async () => {
    await setup(true);
    speech.listening$.next(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Stop Recording');
    expect(text).toContain('Listening');
  });

  it('Permission denied — surfaces friendly error from recognitionError stream', async () => {
    await setup(true);
    speech.error$.next({
      code: 'not-allowed',
      message: SPEECH_PERMISSION_DENIED_MESSAGE,
    });
    fixture.detectChanges();

    const messageEl = fixture.debugElement.query(By.css('.voice-input-message'));
    expect(messageEl.nativeElement.textContent).toContain('Microphone access was denied');
  });

  it('No speech detected — surfaces friendly message', async () => {
    await setup(true);
    speech.error$.next({
      code: 'no-speech',
      message: SPEECH_NO_SPEECH_MESSAGE,
    });
    fixture.detectChanges();

    const messageEl = fixture.debugElement.query(By.css('.voice-input-message'));
    expect(messageEl.nativeElement.textContent).toContain('No speech detected');
  });

  it('Unsupported browser — disables microphone control gracefully', async () => {
    await setup(false);
    fixture.detectChanges();

    const harness = component as unknown as { isUnsupported: boolean };
    expect(harness.isUnsupported).toBeTrue();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain(SPEECH_UNSUPPORTED_MESSAGE.split('.')[0]);
  });

  it('Transcript received — re-emits finalized transcript after Stop only', async () => {
    await setup(true);
    const emitted: string[] = [];
    component.transcript.subscribe((value) => emitted.push(value));

    speech.liveTranscript$.next('partial text while speaking');
    expect(emitted).toEqual([]);

    speech.transcript$.next('Unauthorized Amazon charge of 2500 rupees');

    expect(emitted).toEqual(['Unauthorized Amazon charge of 2500 rupees']);
  });
});
