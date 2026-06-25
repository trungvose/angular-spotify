export type AiAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface LanguageDetectionResult {
  lang: string;
  confidence: number;
}

export interface PinyinSession {
  prompt(input: string, opts?: { signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}

export interface CreateSessionOptions {
  onDownloadProgress?: (loaded: number) => void;
  signal?: AbortSignal;
}

// Minimal ambient typings for Chrome's global built-in AI APIs.
declare global {
  // eslint-disable-next-line no-var
  var LanguageModel:
    | {
        availability(): Promise<AiAvailability>;
        create(options?: {
          initialPrompts?: { role: 'system' | 'user'; content: string }[];
          monitor?: (m: {
            addEventListener(
              type: 'downloadprogress',
              cb: (e: { loaded: number }) => void
            ): void;
          }) => void;
          signal?: AbortSignal;
        }): Promise<PinyinSession>;
      }
    | undefined;

  // eslint-disable-next-line no-var
  var LanguageDetector:
    | {
        availability(): Promise<AiAvailability>;
        create(): Promise<{
          detect(
            text: string
          ): Promise<{ detectedLanguage: string; confidence: number }[]>;
        }>;
      }
    | undefined;
}
