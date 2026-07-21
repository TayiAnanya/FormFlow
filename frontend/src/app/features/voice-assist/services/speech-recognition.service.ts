import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import {
  BrowserSpeechRecognition,
  BrowserSpeechRecognitionConstructor,
  SPEECH_GENERIC_ERROR_MESSAGE,
  SPEECH_NO_SPEECH_MESSAGE,
  SPEECH_PERMISSION_DENIED_MESSAGE,
  SPEECH_UNSUPPORTED_MESSAGE,
  SpeechRecognitionError,
  SpeechRecognitionErrorCode,
  SpeechRecognitionStartOptions,
} from '../models/speech-recognition.model';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence?: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

/**
 * Thin Web Speech API wrapper — no UI logic.
 *
 * Manual recording model:
 * - `start()` opens a session and keeps listening (restarts if the browser ends early).
 * - Partial / interim speech is exposed via `liveTranscript$` only.
 * - `transcript$` emits once when the user calls `stop()` with a non-empty final transcript.
 */
@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private recognition: BrowserSpeechRecognition | null = null;
  private sessionActive = false;
  private accumulatedFinal = '';
  private latestInterim = '';
  private confidenceSum = 0;
  private confidenceCount = 0;
  private startOptions: SpeechRecognitionStartOptions = {};
  private restartScheduled = false;

  private readonly listeningSubject = new BehaviorSubject<boolean>(false);
  private readonly transcriptSubject = new Subject<string>();
  private readonly liveTranscriptSubject = new BehaviorSubject<string>('');
  private readonly interimTranscriptSubject = new Subject<string>();
  private readonly errorSubject = new Subject<SpeechRecognitionError>();

  readonly listening$ = this.listeningSubject.asObservable();
  /** Emits once per completed recording session (after Stop). */
  readonly transcript$ = this.transcriptSubject.asObservable();
  /** Live accumulated text while recording (finals + current interim). */
  readonly liveTranscript$ = this.liveTranscriptSubject.asObservable();
  readonly interimTranscript$ = this.interimTranscriptSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  isSupported(): boolean {
    return this.resolveConstructor() !== null;
  }

  isListening(): boolean {
    return this.listeningSubject.value;
  }

  /** Average speech-engine confidence for finals captured in the current session (0–1), or null. */
  getAverageConfidence(): number | null {
    if (this.confidenceCount === 0) {
      return null;
    }
    return this.confidenceSum / this.confidenceCount;
  }

  start(options: SpeechRecognitionStartOptions = {}): void {
    if (!this.isSupported()) {
      this.errorSubject.next({
        code: 'unsupported',
        message: SPEECH_UNSUPPORTED_MESSAGE,
      });
      return;
    }

    if (this.sessionActive) {
      this.abortSession(false);
    }

    this.startOptions = {
      lang: options.lang ?? 'en-IN',
      continuous: options.continuous ?? true,
      interimResults: options.interimResults ?? true,
    };
    this.sessionActive = true;
    this.accumulatedFinal = '';
    this.latestInterim = '';
    this.confidenceSum = 0;
    this.confidenceCount = 0;
    this.liveTranscriptSubject.next('');
    this.beginRecognition();
  }

  /**
   * Ends the recording session. Emits the finalized transcript, or a no-speech error
   * when nothing was captured.
   */
  stop(): void {
    if (!this.sessionActive && !this.recognition) {
      this.listeningSubject.next(false);
      return;
    }

    this.sessionActive = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
    } else {
      this.finalizeStoppedSession();
    }
  }

  abort(): void {
    this.abortSession(true);
  }

  private abortSession(emitAborted: boolean): void {
    this.sessionActive = false;
    this.restartScheduled = false;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Recognition may already be aborted.
      }
      this.recognition = null;
    }

    this.listeningSubject.next(false);
    this.latestInterim = '';
    this.publishLiveTranscript();

    if (emitAborted) {
      this.errorSubject.next({
        code: 'aborted',
        message: SPEECH_GENERIC_ERROR_MESSAGE,
      });
    }
  }

  private beginRecognition(): void {
    const Recognition = this.resolveConstructor();
    if (!Recognition || !this.sessionActive) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = this.startOptions.lang ?? 'en-IN';
    recognition.continuous = this.startOptions.continuous ?? true;
    recognition.interimResults = this.startOptions.interimResults ?? true;

    recognition.onstart = () => {
      this.listeningSubject.next(true);
    };

    recognition.onresult = (event: Event) => {
      this.handleResult(event as SpeechRecognitionEventLike);
    };

    recognition.onerror = (event: Event) => {
      this.handleError(event as SpeechRecognitionErrorEventLike);
    };

    recognition.onend = () => {
      this.recognition = null;

      if (this.sessionActive) {
        this.scheduleRestart();
        return;
      }

      this.finalizeStoppedSession();
    };

    this.recognition = recognition;

    try {
      recognition.start();
    } catch {
      if (this.sessionActive) {
        this.scheduleRestart();
        return;
      }

      this.listeningSubject.next(false);
      this.recognition = null;
      this.errorSubject.next({
        code: 'unknown',
        message: SPEECH_GENERIC_ERROR_MESSAGE,
      });
    }
  }

  private scheduleRestart(): void {
    if (!this.sessionActive || this.restartScheduled) {
      return;
    }

    this.restartScheduled = true;
    queueMicrotask(() => {
      this.restartScheduled = false;
      if (this.sessionActive && !this.recognition) {
        this.beginRecognition();
      }
    });
  }

  private finalizeStoppedSession(): void {
    this.listeningSubject.next(false);

    const finalized = this.composeFinalTranscript();
    this.latestInterim = '';
    this.publishLiveTranscript();

    if (finalized) {
      this.transcriptSubject.next(finalized);
      return;
    }

    this.errorSubject.next({
      code: 'no-speech',
      message: SPEECH_NO_SPEECH_MESSAGE,
    });
  }

  private composeFinalTranscript(): string {
    const parts = [this.accumulatedFinal.trim(), this.latestInterim.trim()].filter(Boolean);
    return parts.join(' ').trim();
  }

  private publishLiveTranscript(): void {
    const live = [this.accumulatedFinal.trim(), this.latestInterim.trim()].filter(Boolean).join(' ');
    this.liveTranscriptSubject.next(live);
  }

  private handleResult(event: SpeechRecognitionEventLike): void {
    let interim = '';

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const alternative = result?.[0];
      const piece = alternative?.transcript?.trim() ?? '';
      if (!piece) {
        continue;
      }

      if (result.isFinal) {
        this.accumulatedFinal = this.accumulatedFinal
          ? `${this.accumulatedFinal} ${piece}`
          : piece;

        const confidence = alternative?.confidence;
        if (typeof confidence === 'number' && Number.isFinite(confidence) && confidence > 0) {
          this.confidenceSum += confidence;
          this.confidenceCount += 1;
        }
      } else {
        interim = interim ? `${interim} ${piece}` : piece;
      }
    }

    this.latestInterim = interim;
    if (interim) {
      this.interimTranscriptSubject.next(interim);
    }
    this.publishLiveTranscript();
  }

  private handleError(event: SpeechRecognitionErrorEventLike): void {
    const code = this.mapErrorCode(event.error);

    // Continuous sessions: ignore transient no-speech / aborted; keep listening until Stop.
    if (this.sessionActive && (code === 'no-speech' || code === 'aborted')) {
      return;
    }

    this.sessionActive = false;
    this.listeningSubject.next(false);
    this.recognition = null;
    this.errorSubject.next({
      code,
      message: this.messageForCode(code),
    });
  }

  private mapErrorCode(raw: string): SpeechRecognitionErrorCode {
    switch (raw) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'not-allowed';
      case 'no-speech':
        return 'no-speech';
      case 'aborted':
        return 'aborted';
      case 'audio-capture':
        return 'audio-capture';
      case 'network':
        return 'network';
      case 'bad-grammar':
        return 'bad-grammar';
      case 'language-not-supported':
        return 'language-not-supported';
      default:
        return 'unknown';
    }
  }

  private messageForCode(code: SpeechRecognitionErrorCode): string {
    switch (code) {
      case 'not-allowed':
        return SPEECH_PERMISSION_DENIED_MESSAGE;
      case 'unsupported':
        return SPEECH_UNSUPPORTED_MESSAGE;
      case 'no-speech':
        return SPEECH_NO_SPEECH_MESSAGE;
      case 'aborted':
        return SPEECH_GENERIC_ERROR_MESSAGE;
      default:
        return SPEECH_GENERIC_ERROR_MESSAGE;
    }
  }

  private resolveConstructor(): BrowserSpeechRecognitionConstructor | null {
    const win = window as unknown as {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
  }
}
