export type AiAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface LanguageDetectionResult {
  lang: string;
  confidence: number;
}

export interface DetectorInstance {
  detect(text: string): Promise<{ detectedLanguage: string; confidence: number }[]>;
}

export interface AnnotationSession {
  prompt(input: string, opts?: { signal?: AbortSignal }): Promise<string>;
  clone(opts?: { signal?: AbortSignal }): Promise<AnnotationSession>;
  destroy(): void;
}

export interface CreateSessionOptions {
  onDownloadProgress?: (loaded: number) => void;
  signal?: AbortSignal;
}

/** What a prompt-based annotator needs from the Prompt API. */
export interface PromptEngineSpec {
  /** Annotator id — cache key; one base session lives per id. */
  id: string;
  systemPrompt: string;
  batchInstruction: string;
}

/** What a translation annotator needs from the Translator API. */
export interface TranslatorEngineSpec {
  /** Annotator id — cache key; one translator lives per id. */
  id: string;
  /** BCP-47 tags passed to Translator.create (e.g. 'vi' → 'en'). */
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslatorInstance {
  translate(input: string, opts?: { signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}

/**
 * A prepared annotation backend for one song. Two implementations exist:
 * the Prompt API engine (getPromptEngine, transliteration pairs) and the
 * Translator API engine (getTranslatorEngine, translation pairs).
 */
export interface AnnotationEngine {
  ensureReady(opts?: CreateSessionOptions): Promise<void>;
  annotateBatch(lines: string[], signal?: AbortSignal): Promise<string[]>;
  destroy(): void;
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
        }): Promise<AnnotationSession>;
      }
    | undefined;

  // eslint-disable-next-line no-var
  var Translator:
    | {
        availability(options: {
          sourceLanguage: string;
          targetLanguage: string;
        }): Promise<AiAvailability>;
        create(options: {
          sourceLanguage: string;
          targetLanguage: string;
          monitor?: (m: {
            addEventListener(
              type: 'downloadprogress',
              cb: (e: { loaded: number }) => void
            ): void;
          }) => void;
          signal?: AbortSignal;
        }): Promise<TranslatorInstance>;
      }
    | undefined;

  // eslint-disable-next-line no-var
  var LanguageDetector:
    | {
        availability(): Promise<AiAvailability>;
        create(): Promise<DetectorInstance>;
      }
    | undefined;
}
