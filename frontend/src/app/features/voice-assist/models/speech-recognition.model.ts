/** Browser speech-recognition error codes normalised for the app. */
export type SpeechRecognitionErrorCode =
  | 'not-allowed'
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'unsupported'
  | 'unknown';

export interface SpeechRecognitionError {
  code: SpeechRecognitionErrorCode;
  message: string;
}

export interface SpeechRecognitionStartOptions {
  /** BCP-47 language tag. Defaults to `en-IN`. */
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

/** Minimal SpeechRecognition surface used by the service (Web Speech API). */
export interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: Event) => void) | null;
}

export type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export const SPEECH_PERMISSION_DENIED_MESSAGE =
  'Microphone access was denied. Please allow microphone permission in your browser settings, or continue filling the form manually.';

export const SPEECH_UNSUPPORTED_MESSAGE =
  'Voice input is not supported in this browser. Please fill the form manually or try Chrome / Edge.';

export const SPEECH_GENERIC_ERROR_MESSAGE =
  'Voice input could not be completed. Please try again or continue filling the form manually.';

export const SPEECH_NO_SPEECH_MESSAGE = 'No speech detected. Please try again.';
