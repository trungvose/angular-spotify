import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { BuiltInAiService, PinyinSession } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { Observable } from 'rxjs';
import { LyricsStore } from './lyrics.store';
import { LyricLine } from './lyrics.models';
import { containsHan } from './han-util';
import {
  BATCH_SIZE,
  DETECT_SAMPLE_LINES,
  LOOKAHEAD,
  MIN_CONFIDENCE,
  PinyinLineState,
  PinyinState
} from './pinyin.models';

const initialState: PinyinState = {
  enabled: true,
  support: 'unknown',
  downloadState: 'idle',
  isChinese: false,
  pinyinByIndex: {},
  windowEnd: -1,
  visibleRange: null
};

@Injectable({ providedIn: 'root' })
export class PinyinStore extends ComponentStore<PinyinState> {
  /** Shared session for all batch calls within a song; recreated on init. */
  private session: PinyinSession | null = null;

  /**
   * Serial queue: a promise chain that ensures batches run one at a time.
   * Each call to enqueueBatch() appends to this chain.
   */
  private batchQueue: Promise<void> = Promise.resolve();

  constructor(private ai: BuiltInAiService, private lyricsStore: LyricsStore) {
    super(initialState);
    this.watchLyrics();
  }

  readonly enabled$ = this.select((s) => s.enabled);
  readonly downloadState$ = this.select((s) => s.downloadState);
  readonly pinyinByIndex$ = this.select((s) => s.pinyinByIndex);
  readonly visibleRange$ = this.select((s) => s.visibleRange);
  readonly showToggle$: Observable<boolean> = this.select(
    (s) => s.isChinese && s.support === 'supported'
  );

  setEnabled(enabled: boolean): void {
    this.patchState({ enabled });
  }

  /**
   * Called by the view layer to report the currently visible lyric line range.
   * Updates state, then schedules pinyin fetches for [start .. end + LOOKAHEAD].
   */
  setVisibleRange(start: number, end: number): void {
    this.patchState({ visibleRange: { start, end } });
    void this.scheduleWindowFetch(start, end);
  }

  init(lines: LyricLine[]): void {
    this.reset();
    if (!this.ai.isPromptApiAvailable()) {
      this.patchState({ support: 'unsupported' });
      return;
    }
    this.patchState({ support: 'supported' });
    void this.detectAndSeed(lines);
  }

  private async detectAndSeed(lines: LyricLine[]): Promise<void> {
    const sample = lines
      .slice(0, DETECT_SAMPLE_LINES)
      .map((l) => l.text)
      .join('\n');
    const detection = await this.ai.detectLanguage(sample);
    const isChinese =
      !!detection && detection.lang.startsWith('zh') && detection.confidence >= MIN_CONFIDENCE;
    if (!isChinese) {
      this.patchState({ isChinese: false });
      return;
    }
    const pinyinByIndex: Record<number, PinyinLineState> = {};
    lines.forEach((line, i) => {
      if (containsHan(line.text)) {
        pinyinByIndex[i] = { text: line.text, pinyin: null, status: 'pending' };
      }
    });
    this.patchState({ isChinese: true, pinyinByIndex });
  }

  /**
   * Determines which pending lines fall within [start .. end + LOOKAHEAD],
   * splits them into BATCH_SIZE chunks, and enqueues each chunk onto the
   * serial batchQueue.
   */
  private async scheduleWindowFetch(start: number, end: number): Promise<void> {
    const windowEnd = end + LOOKAHEAD;

    // Collect pending indices within the window, skipping already-done lines (index cache).
    const state = this.get();
    const pendingIndices: number[] = [];
    for (let i = start; i <= windowEnd; i++) {
      const entry = state.pinyinByIndex[i];
      if (entry && entry.status === 'pending') {
        pendingIndices.push(i);
      }
    }

    if (pendingIndices.length === 0) {
      return;
    }

    // Ensure we have a session
    if (!this.session) {
      try {
        this.session = await this.ai.createPinyinSession();
      } catch {
        return;
      }
    }

    // Split into batches and enqueue serially
    for (let offset = 0; offset < pendingIndices.length; offset += BATCH_SIZE) {
      const batchIndices = pendingIndices.slice(offset, offset + BATCH_SIZE);
      // Mark them as loading immediately so subsequent calls skip them (index cache)
      this.markLoading(batchIndices);
      this.batchQueue = this.batchQueue.then(() => this.runBatch(batchIndices));
    }
  }

  private markLoading(indices: number[]): void {
    const current = this.get().pinyinByIndex;
    const updated: Record<number, PinyinLineState> = { ...current };
    for (const i of indices) {
      if (updated[i]) {
        updated[i] = { ...updated[i], status: 'loading' };
      }
    }
    this.patchState({ pinyinByIndex: updated });
  }

  private async runBatch(indices: number[]): Promise<void> {
    const state = this.get();
    const lines = indices.map((i) => state.pinyinByIndex[i]?.text ?? '');
    try {
      const results = await this.ai.promptPinyinBatch(this.session!, lines);
      const current = this.get().pinyinByIndex;
      const updated: Record<number, PinyinLineState> = { ...current };
      indices.forEach((idx, pos) => {
        if (updated[idx]) {
          updated[idx] = { ...updated[idx], pinyin: results[pos], status: 'done' };
        }
      });
      this.patchState({ pinyinByIndex: updated });
    } catch {
      const current = this.get().pinyinByIndex;
      const updated: Record<number, PinyinLineState> = { ...current };
      for (const i of indices) {
        if (updated[i]) {
          updated[i] = { ...updated[i], status: 'error' };
        }
      }
      this.patchState({ pinyinByIndex: updated });
    }
  }

  private reset(): void {
    this.session = null;
    this.batchQueue = Promise.resolve();
    this.patchState({
      support: 'unknown',
      downloadState: 'idle',
      isChinese: false,
      pinyinByIndex: {},
      windowEnd: -1,
      visibleRange: null
    });
  }

  private watchLyrics(): void {
    this.lyricsStore.lyrics$.subscribe((lines) => {
      if (lines && lines.length > 0) {
        this.init(lines);
      } else {
        this.reset();
      }
    });
  }
}
