// Web Speech API (SpeechRecognition) is not in TypeScript's DOM lib yet.
// Minimal, loose typing — used only by AIAssistant.tsx behind feature detection.
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: ((e: any) => void) | null;
  onstart: ((e: any) => void) | null;
  [key: string]: any;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};
