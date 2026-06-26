export type PinyinStatus = 'pending' | 'loading' | 'done' | 'error';

export interface PinyinLineState {
  text: string;
  pinyin: string | null;
  status: PinyinStatus;
}

export type PinyinSupport = 'unknown' | 'unsupported' | 'supported';
export type PinyinDownloadState = 'idle' | 'downloading' | 'ready';

export interface PinyinState {
  enabled: boolean;
  support: PinyinSupport;
  downloadState: PinyinDownloadState;
  isChinese: boolean;
  pinyinByIndex: Record<number, PinyinLineState>;
  activeLine: number;
  windowEnd: number;
  visibleRange: { start: number; end: number } | null;
}

export const LOOKAHEAD = 10;
export const PREFETCH_MARGIN = 3;
export const BATCH_SIZE = 8;
export const MIN_CONFIDENCE = 0.5;
export const DETECT_SAMPLE_LINES = 5;
