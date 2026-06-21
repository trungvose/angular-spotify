import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { BuiltInAiService, PinyinSession } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { combineLatest, Observable } from 'rxjs';
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
  private draining = false;
  private queue: number[] = [];
  /** Incremented on every reset(); drainQueue frames check this to detect stale runs. */
  private generation = 0;

  constructor(private ai: BuiltInAiService, private lyricsStore: LyricsStore) {
    super(initialState);
    this.watchLyrics();
    this.watchActiveLine();
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
    if (enabled) this.enqueue();
  }

  setActiveLine(line: number): void {
    const windowEnd = line + LOOKAHEAD;
    this.patchState({ windowEnd });
    this.enqueue();
  }

  setVisibleRange(range: { start: number; end: number } | null): void {
    this.patchState({ visibleRange: range });
    this.enqueue();
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
    const gen = this.generation;
    const sample = lines
      .slice(0, DETECT_SAMPLE_LINES)
      .map((l) => l.text)
      .join('\n');
    const detection = await this.ai.detectLanguage(sample);
    // Guard: if reset() was called while we awaited detection, bail out.
    if (gen !== this.generation) return;
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

  private get focus(): number {
    const { windowEnd, visibleRange } = this.get();
    return windowEnd >= 0 ? windowEnd : (visibleRange ? visibleRange.start : 0);
  }

  private enqueue(): void {
    const { enabled, isChinese, support, pinyinByIndex, windowEnd, visibleRange } = this.get();
    if (!enabled || !isChinese || support !== 'supported') return;
    const indices: number[] = [];
    for (const key of Object.keys(pinyinByIndex)) {
      const index = Number(key);
      const entry = pinyinByIndex[index];
      if (entry.status !== 'pending') continue;
      if (windowEnd >= 0) {
        if (index <= windowEnd) indices.push(index);
      } else {
        if (visibleRange && index >= visibleRange.start && index <= visibleRange.end) {
          indices.push(index);
        }
      }
    }
    // Intentionally replace queue while draining may be active; shared reference ensures
    // the running drainQueue loop picks up new content on its next while iteration.
    this.queue = indices;
    void this.drainQueue();
  }

  private nextBatch(): number[] {
    const f = this.focus;
    this.queue.sort((a, b) => Math.abs(a - f) - Math.abs(b - f));
    return this.queue.splice(0, BATCH_SIZE);
  }

  private async drainQueue(): Promise<void> {
    if (this.draining || !this.get().enabled) return;
    this.draining = true;
    const gen = this.generation;
    try {
      if (!this.session) {
        this.patchState({ downloadState: 'downloading' });
        this.session = await this.ai.createPinyinSession({
          onDownloadProgress: () => this.patchState({ downloadState: 'downloading' })
        });
        // Guard: if reset() was called while we awaited session creation, bail out.
        if (gen !== this.generation) return;
        this.patchState({ downloadState: 'ready' });
      }
      while (this.queue.length > 0) {
        if (!this.get().enabled) break;
        const batch = this.nextBatch();
        if (batch.length === 0) break;
        // Guard: if reset() fired since we entered this loop iteration, bail out
        // before writing loading state into the new track's map.
        if (gen !== this.generation) break;
        const patch: Record<number, PinyinLineState> = {};
        for (const idx of batch) {
          patch[idx] = { ...this.get().pinyinByIndex[idx], status: 'loading' };
        }
        this.patchMany(patch);
        try {
          const texts = batch.map((i) => this.get().pinyinByIndex[i].text);
          const results = await this.ai.promptPinyinBatch(this.session, texts);
          // Generation guard: discard stale results from a previous track.
          if (gen !== this.generation) return;
          const donePatch: Record<number, PinyinLineState> = {};
          batch.forEach((idx, i) => {
            donePatch[idx] = { ...this.get().pinyinByIndex[idx], pinyin: results[i], status: 'done' };
          });
          this.patchMany(donePatch);
        } catch {
          // Generation guard: don't write error state for a previous track either.
          if (gen !== this.generation) return;
          const errPatch: Record<number, PinyinLineState> = {};
          for (const idx of batch) {
            errPatch[idx] = { ...this.get().pinyinByIndex[idx], status: 'error' };
          }
          this.patchMany(errPatch);
        }
      }
    } finally {
      // Only clear the draining flag if we still own this generation.
      if (gen === this.generation) {
        this.draining = false;
      }
    }
  }

  private patchMany(patch: Record<number, PinyinLineState>): void {
    this.patchState((s) => ({
      pinyinByIndex: { ...s.pinyinByIndex, ...patch }
    }));
  }

  private reset(): void {
    this.session?.destroy();
    this.session = null;
    this.generation++;
    this.draining = false;
    this.queue = [];
    this.patchState({
      support: 'unknown',
      downloadState: 'idle',
      isChinese: false,
      pinyinByIndex: {},
      windowEnd: -1,
      visibleRange: null
    });
  }

  private watchActiveLine(): void {
    combineLatest([this.lyricsStore.isSynced$, this.lyricsStore.activeLine$]).subscribe(
      ([isSynced, activeLine]) => {
        if (isSynced && this.get().isChinese && this.get().enabled && activeLine >= 0) {
          this.setActiveLine(activeLine);
        }
      }
    );
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
