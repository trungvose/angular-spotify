import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { AnnotationEngine, BuiltInAiService } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { combineLatest, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { LyricsStore } from './lyrics.store';
import { LyricLine } from './lyrics.models';
import { findAnnotatorForLanguage, getAnnotatorById } from './annotators';
import {
  AnnotationLineState,
  AnnotationState,
  AnnotatorConfig,
  BATCH_SIZE,
  DETECT_SAMPLE_LINES,
  LOOKAHEAD,
  MIN_CONFIDENCE
} from './annotation.models';

const initialState: AnnotationState = {
  enabled: true,
  support: 'unknown',
  downloadState: 'idle',
  activeAnnotatorId: null,
  annotationByIndex: {},
  activeLine: -1,
  windowEnd: -1,
  visibleRange: null
};

@Injectable({ providedIn: 'root' })
export class LyricsAnnotationStore extends ComponentStore<AnnotationState> {
  /** Shared engine for all batch calls within a song; recreated per track. */
  private engine: AnnotationEngine | null = null;
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
  readonly annotationByIndex$ = this.select((s) => s.annotationByIndex);
  readonly visibleRange$ = this.select((s) => s.visibleRange);

  /** The registry config matching the detected language, or null when none applies. */
  readonly activeAnnotator$: Observable<AnnotatorConfig | null> = this.select((s) =>
    s.activeAnnotatorId ? getAnnotatorById(s.activeAnnotatorId) : null
  );

  /** True once at least one line has rendered its annotation. */
  readonly hasRenderedAnnotation$: Observable<boolean> = this.select((s) =>
    Object.values(s.annotationByIndex).some((line) => line.status === 'done')
  );

  /**
   * Only surface the toggle once annotations actually start rendering — before
   * that there is nothing to show/hide, and the page-level status conveys progress.
   */
  readonly showToggle$: Observable<boolean> = this.select(
    (s) =>
      s.activeAnnotatorId !== null &&
      s.support === 'supported' &&
      Object.values(s.annotationByIndex).some((line) => line.status === 'done')
  );

  /**
   * Status text for the lyrics-page pill (bottom-right) before any annotation
   * appears. Null once annotations render (they are then the feedback) or when
   * the feature doesn't apply. The "preparing" copy comes from the active config.
   */
  readonly pageStatusText$: Observable<string | null> = this.select((s): string | null => {
    if (!s.activeAnnotatorId || s.support !== 'supported') return null;
    const config = getAnnotatorById(s.activeAnnotatorId);
    if (!config) return null;
    const hasAnnotation = Object.values(s.annotationByIndex).some((l) => l.status === 'done');
    if (hasAnnotation) return null;
    return s.downloadState === 'downloading'
      ? 'Downloading language model…'
      : config.toggle.preparingLabel;
  });

  setEnabled(enabled: boolean): void {
    this.patchState({ enabled });
    if (enabled) this.enqueue();
  }

  setActiveLine(line: number): void {
    const windowEnd = line + LOOKAHEAD;
    this.patchState({ activeLine: line, windowEnd });
    this.enqueue();
  }

  setVisibleRange(range: { start: number; end: number } | null): void {
    this.patchState({ visibleRange: range });
    this.enqueue();
  }

  init(lines: LyricLine[]): void {
    this.reset();
    // Either backend may exist without the other (Prompt API is flag-gated,
    // Translator ships wider); which one the matched pair needs is checked
    // per config in detectAndSeed.
    if (!this.ai.isPromptApiAvailable() && !this.ai.isTranslatorApiAvailable()) {
      this.patchState({ support: 'unsupported' });
      return;
    }
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
    const config =
      detection && detection.confidence >= MIN_CONFIDENCE
        ? findAnnotatorForLanguage(detection.lang)
        : null;
    if (!config) {
      this.patchState({ activeAnnotatorId: null });
      return;
    }
    // Translation pairs ask the Translator API instead of the Prompt API.
    const availability =
      config.kind === 'translator'
        ? await this.ai.checkTranslatorAvailability(config.sourceLanguage, config.targetLanguage)
        : await this.ai.checkAvailability();
    if (gen !== this.generation) return;
    if (availability === 'unavailable') {
      this.patchState({ support: 'unsupported', activeAnnotatorId: null });
      return;
    }
    const annotationByIndex: Record<number, AnnotationLineState> = {};
    lines.forEach((line, i) => {
      if (config.lineQualifies(line.text)) {
        annotationByIndex[i] = { text: line.text, annotation: null, status: 'pending' };
      }
    });
    // No qualifying lines (e.g. LRCLIB served already-romanized lyrics that
    // still detect as ja) — go silently inactive instead of leaving the
    // "Preparing…" pill up with nothing to ever drain.
    if (Object.keys(annotationByIndex).length === 0) {
      this.patchState({ activeAnnotatorId: null });
      return;
    }
    this.patchState({ support: 'supported', activeAnnotatorId: config.id, annotationByIndex });
    // Warm the session now — annotator matched, availability confirmed, lines
    // qualify — so the model spins up in parallel with the window seeding below.
    void this.prepareEngine(gen, config).catch(() => undefined);
    // Nothing else opens the first window in two common cases:
    // - a paused song: activeLine$ already emitted, so the active-line driver
    //   will not fire again until playback moves
    // - an instrumental intro: activeLine stays -1 until the first sung line,
    //   and the viewport observer only covers unsynced lyrics
    // Seed it ourselves. Use the active line when there is one, otherwise
    // start at line 0 so the lyrics annotate while the intro is still playing.
    combineLatest([this.lyricsStore.isSynced$, this.lyricsStore.activeLine$])
      .pipe(take(1))
      .subscribe(([isSynced, activeLine]) => {
        if (activeLine >= 0) {
          this.setActiveLine(activeLine);
        } else if (isSynced) {
          this.setActiveLine(0);
        }
      });
  }

  private get focus(): number {
    const { activeLine, visibleRange } = this.get();
    return activeLine >= 0 ? activeLine : visibleRange ? visibleRange.start : 0;
  }

  private enqueue(): void {
    const { enabled, activeAnnotatorId, support, annotationByIndex, windowEnd, visibleRange } =
      this.get();
    if (!enabled || !activeAnnotatorId || support !== 'supported') return;
    const indices: number[] = [];
    for (const key of Object.keys(annotationByIndex)) {
      const index = Number(key);
      const entry = annotationByIndex[index];
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

  private createEngineFor(config: AnnotatorConfig): AnnotationEngine {
    switch (config.kind) {
      case 'prompt':
        return this.ai.getPromptEngine({
          id: config.id,
          systemPrompt: config.systemPrompt,
          batchInstruction: config.batchInstruction
        });
      case 'translator':
        return this.ai.getTranslatorEngine({
          id: config.id,
          sourceLanguage: config.sourceLanguage,
          targetLanguage: config.targetLanguage
        });
      default:
        throw new Error(`No annotation engine for kind: ${(config as AnnotatorConfig).kind}`);
    }
  }

  /**
   * Acquire and prepare the engine for this generation. Called fire-and-forget
   * from detectAndSeed (warm-up, per Chrome's "create the session when intent
   * is clear") and awaited from drainQueue; the service memoizes the in-flight
   * creation so both share one LanguageModel.create(). Returns false when
   * reset() fired while preparing — the engine is NOT adopted, but never
   * destroyed either: base sessions live in the service cache keyed by
   * annotator id, so a same-language track later starts warm and a
   * wrong-language track can't receive it by construction.
   */
  private async prepareEngine(gen: number, config: AnnotatorConfig): Promise<boolean> {
    if (!this.engine) {
      const engine = this.createEngineFor(config);
      this.patchState({ downloadState: 'downloading' });
      await engine.ensureReady({
        onDownloadProgress: () => this.patchState({ downloadState: 'downloading' })
      });
      if (gen !== this.generation) {
        return false;
      }
      this.engine = engine;
      this.patchState({ downloadState: 'ready' });
    }
    return gen === this.generation;
  }

  private async drainQueue(): Promise<void> {
    if (this.draining || !this.get().enabled) return;
    const { activeAnnotatorId } = this.get();
    const config = activeAnnotatorId ? getAnnotatorById(activeAnnotatorId) : null;
    if (!config) return;
    this.draining = true;
    const gen = this.generation;
    try {
      if (!(await this.prepareEngine(gen, config))) {
        return;
      }
      const engine = this.engine;
      if (!engine) {
        return;
      }
      while (this.queue.length > 0) {
        if (!this.get().enabled) break;
        const batch = this.nextBatch();
        if (batch.length === 0) break;
        // Guard: if reset() fired since we entered this loop iteration, bail out
        // before writing loading state into the new track's map.
        if (gen !== this.generation) break;
        const patch: Record<number, AnnotationLineState> = {};
        for (const idx of batch) {
          patch[idx] = { ...this.get().annotationByIndex[idx], status: 'loading' };
        }
        this.patchMany(patch);
        try {
          const texts = batch.map((i) => this.get().annotationByIndex[i].text);
          const results = await engine.annotateBatch(texts);
          // Generation guard: discard stale results from a previous track.
          if (gen !== this.generation) return;
          const donePatch: Record<number, AnnotationLineState> = {};
          batch.forEach((idx, i) => {
            donePatch[idx] = {
              ...this.get().annotationByIndex[idx],
              annotation: results[i],
              status: 'done'
            };
          });
          this.patchMany(donePatch);
        } catch {
          // Generation guard: don't write error state for a previous track either.
          if (gen !== this.generation) return;
          const errPatch: Record<number, AnnotationLineState> = {};
          for (const idx of batch) {
            errPatch[idx] = { ...this.get().annotationByIndex[idx], status: 'error' };
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

  private patchMany(patch: Record<number, AnnotationLineState>): void {
    this.patchState((s) => ({
      annotationByIndex: { ...s.annotationByIndex, ...patch }
    }));
  }

  private reset(): void {
    // Drop the reference only — the base session stays cached in
    // BuiltInAiService so the next same-language track starts warm.
    this.engine = null;
    this.generation++;
    this.draining = false;
    this.queue = [];
    this.patchState({
      support: 'unknown',
      downloadState: 'idle',
      activeAnnotatorId: null,
      annotationByIndex: {},
      activeLine: -1,
      windowEnd: -1,
      visibleRange: null
    });
  }

  private watchActiveLine(): void {
    combineLatest([this.lyricsStore.isSynced$, this.lyricsStore.activeLine$]).subscribe(
      ([isSynced, activeLine]) => {
        const { activeAnnotatorId, enabled } = this.get();
        if (isSynced && activeAnnotatorId && enabled && activeLine >= 0) {
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
