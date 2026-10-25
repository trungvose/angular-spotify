export type AnnotationStatus = 'pending' | 'loading' | 'done' | 'error';

export interface AnnotationLineState {
  text: string;
  annotation: string | null;
  status: AnnotationStatus;
}

export type AnnotationSupport = 'unknown' | 'unsupported' | 'supported';
export type AnnotationDownloadState = 'idle' | 'downloading' | 'ready';

export type AnnotatorKind = 'prompt' | 'translator';

export interface AnnotatorToggleConfig {
  /** Glyph rendered in the now-playing-bar toggle button (拼, あ). */
  icon: string;
  tooltipShow: string;
  tooltipHide: string;
  /** Page-pill text before the first line renders ("Preparing pinyin…"). */
  preparingLabel: string;
}

/**
 * One language pair, declaratively. Adding a pair = one config file + one
 * entry in the ANNOTATORS registry; the store machinery is shared.
 */
export interface AnnotatorConfigBase {
  id: string;
  kind: AnnotatorKind;
  /** Matched against the BCP-47 tag from LanguageDetector (e.g. 'zh-Hant', 'vi'). */
  matchesLanguage(lang: string): boolean;
  /** Which lines get an annotation entry (skips ♪ / decoration-only lines). */
  lineQualifies(text: string): boolean;
  toggle: AnnotatorToggleConfig;
}

/** Transliteration pair backed by the Prompt API (Gemini Nano). */
export interface PromptAnnotatorConfig extends AnnotatorConfigBase {
  kind: 'prompt';
  systemPrompt: string;
  batchInstruction: string;
}

/** Translation pair backed by the Translator API. */
export interface TranslatorAnnotatorConfig extends AnnotatorConfigBase {
  kind: 'translator';
  /** Passed to Translator.availability()/create() — support is checked per pair. */
  sourceLanguage: string;
  targetLanguage: string;
}

export type AnnotatorConfig = PromptAnnotatorConfig | TranslatorAnnotatorConfig;

export interface AnnotationState {
  enabled: boolean;
  support: AnnotationSupport;
  downloadState: AnnotationDownloadState;
  /** Registry id of the annotator matching the detected language, else null. */
  activeAnnotatorId: string | null;
  annotationByIndex: Record<number, AnnotationLineState>;
  activeLine: number;
  windowEnd: number;
  visibleRange: { start: number; end: number } | null;
}

export const LOOKAHEAD = 10;
export const BATCH_SIZE = 8;
export const MIN_CONFIDENCE = 0.5;
export const DETECT_SAMPLE_LINES = 5;
