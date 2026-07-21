import { Component, EventEmitter, OnDestroy, Output, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';

import {
  SPEECH_NO_SPEECH_MESSAGE,
  SPEECH_UNSUPPORTED_MESSAGE,
  SpeechRecognitionError,
} from '../../models/speech-recognition.model';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';

export type VoiceInputUiState = 'idle' | 'listening' | 'unsupported';

/**
 * Reusable microphone control — not tied to any specific banking form.
 * Manual Start / Stop recording; emits a finalized transcript only after Stop.
 */
@Component({
  selector: 'app-voice-input',
  standalone: true,
  imports: [Button, Message],
  templateUrl: './voice-input.component.html',
  styleUrl: './voice-input.component.css',
})
export class VoiceInputComponent implements OnDestroy {
  private readonly speech = inject(SpeechRecognitionService);
  private readonly subscriptions = new Subscription();

  @Output() readonly transcript = new EventEmitter<string>();
  @Output() readonly listeningChange = new EventEmitter<boolean>();
  @Output() readonly recognitionError = new EventEmitter<SpeechRecognitionError>();
  /** Average speech-engine confidence from the completed session (0–1), when available. */
  @Output() readonly speechConfidence = new EventEmitter<number | null>();

  protected uiState: VoiceInputUiState = 'idle';
  protected errorMessage: string | null = null;
  protected livePreview = '';

  constructor() {
    if (!this.speech.isSupported()) {
      this.uiState = 'unsupported';
    }

    this.subscriptions.add(
      this.speech.listening$.subscribe((listening) => {
        this.uiState = !this.speech.isSupported()
          ? 'unsupported'
          : listening
            ? 'listening'
            : 'idle';
        this.listeningChange.emit(listening);
      }),
    );

    this.subscriptions.add(
      this.speech.liveTranscript$.subscribe((text) => {
        this.livePreview = text;
      }),
    );

    this.subscriptions.add(
      this.speech.transcript$.subscribe((text) => {
        this.speechConfidence.emit(this.speech.getAverageConfidence());
        this.transcript.emit(text);
      }),
    );

    this.subscriptions.add(
      this.speech.error$.subscribe((error) => {
        this.errorMessage = error.message;
        this.recognitionError.emit(error);
        if (error.code === 'unsupported') {
          this.uiState = 'unsupported';
        } else {
          this.uiState = 'idle';
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.speech.abort();
    this.subscriptions.unsubscribe();
  }

  protected get isUnsupported(): boolean {
    return this.uiState === 'unsupported';
  }

  protected get isListening(): boolean {
    return this.uiState === 'listening';
  }

  protected get unsupportedMessage(): string {
    return SPEECH_UNSUPPORTED_MESSAGE;
  }

  protected get noSpeechMessage(): string {
    return SPEECH_NO_SPEECH_MESSAGE;
  }

  protected startRecording(): void {
    if (this.isUnsupported || this.isListening) {
      return;
    }

    this.errorMessage = null;
    this.livePreview = '';
    this.speech.start({
      lang: 'en-IN',
      continuous: true,
      interimResults: true,
    });
  }

  protected stopRecording(): void {
    if (!this.isListening) {
      return;
    }

    this.errorMessage = null;
    this.speech.stop();
  }
}
