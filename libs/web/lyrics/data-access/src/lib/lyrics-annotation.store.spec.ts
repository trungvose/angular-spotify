import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { BuiltInAiService } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { LyricsStore } from './lyrics.store';
import { LyricsAnnotationStore } from './lyrics-annotation.store';
import { LyricLine } from './lyrics.models';

const flush = () => new Promise((r) => setTimeout(r, 0));

const makeEngine = () => ({
  ensureReady: jest.fn().mockResolvedValue(undefined),
  annotateBatch: jest.fn().mockResolvedValue([]),
  destroy: jest.fn()
});

describe('LyricsAnnotationStore — detection gating', () => {
  let store: LyricsAnnotationStore;
  let engine: ReturnType<typeof makeEngine>;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isTranslatorApiAvailable: jest.Mock;
    checkTranslatorAvailability: jest.Mock;
    getTranslatorEngine: jest.Mock;
    isDetectorAvailable: jest.Mock;
    checkAvailability: jest.Mock;
    detectLanguage: jest.Mock;
    getPromptEngine: jest.Mock;
  };
  let lyrics$: BehaviorSubject<LyricLine[] | null>;

  const read = <T>(obs: { pipe: any }): T => {
    let v!: T;
    (obs as any).pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    engine = makeEngine();
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isTranslatorApiAvailable: jest.fn().mockReturnValue(true),
      checkTranslatorAvailability: jest.fn().mockResolvedValue('available'),
      getTranslatorEngine: jest.fn(() => engine),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      checkAvailability: jest.fn().mockResolvedValue('available'),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      getPromptEngine: jest.fn(() => engine)
    };
    TestBed.configureTestingModule({
      providers: [
        LyricsAnnotationStore,
        { provide: BuiltInAiService, useValue: ai },
        // Unsynced on purpose: these tests cover detection gating only. A
        // synced track would auto-seed a window at line 0 and start draining.
        { provide: LyricsStore, useValue: { lyrics$, isSynced$: of(false), activeLine$: of(-1) } }
      ]
    });
    store = TestBed.inject(LyricsAnnotationStore);
  });

  it('marks support unsupported and stays silent when both AI APIs are missing', async () => {
    ai.isPromptApiAvailable.mockReturnValue(false);
    ai.isTranslatorApiAvailable.mockReturnValue(false);
    store.init([{ time: 0, text: '你好' }]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(ai.detectLanguage).not.toHaveBeenCalled();
  });

  it('seeds pending entries only for Han lines when Chinese (toggle still hidden)', async () => {
    store.init([
      { time: 0, text: '你好' },
      { time: 1, text: 'instrumental break' },
      { time: 2, text: '再见' }
    ]);
    await flush();
    // Toggle stays hidden until annotations actually render, even though Chinese is detected.
    expect(read<boolean>(store.showToggle$)).toBe(false);
    const map = read<Record<number, any>>(store.annotationByIndex$);
    expect(Object.keys(map)).toEqual(['0', '2']);
    expect(map[0]).toEqual({ text: '你好', annotation: null, status: 'pending' });
  });

  it('stays silent when detection is not Chinese', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'en', confidence: 0.99 });
    store.init([{ time: 0, text: 'hello' }]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
  });

  it('stays silent when confidence is below MIN_CONFIDENCE', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'zh', confidence: 0.2 });
    store.init([{ time: 0, text: '你好' }]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
  });

  it('activates romaji for Japanese lyrics', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'ja', confidence: 0.9 });
    engine.annotateBatch.mockResolvedValue(['arigatō']);
    store.init([{ time: 0, text: 'ありがとう' }]);
    await flush();
    store.setActiveLine(0);
    await flush();
    await flush();
    const map = read<Record<number, any>>(store.annotationByIndex$);
    expect(map[0]).toEqual({ text: 'ありがとう', annotation: 'arigatō', status: 'done' });
    // The engine was built from the romaji config's prompts.
    expect(ai.getPromptEngine.mock.calls[0][0].systemPrompt).toContain('Hepburn');
    expect(read<string | null>(store.pageStatusText$)).toBeNull();
  });

  it('checks Prompt API availability and stays silent when unavailable', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'ja', confidence: 0.9 });
    ai.checkAvailability.mockResolvedValue('unavailable');
    store.init([{ time: 0, text: 'ありがとう' }]);
    await flush();
    expect(ai.checkAvailability).toHaveBeenCalled();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(read<string | null>(store.pageStatusText$)).toBeNull();
    expect(ai.getPromptEngine).not.toHaveBeenCalled();
  });

  it('stays silent for a detected language with no registered annotator', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'ko', confidence: 0.99 });
    store.init([{ time: 0, text: '안녕하세요' }]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(ai.checkAvailability).not.toHaveBeenCalled();
  });

  it('activates the vi-en translator for Vietnamese lyrics', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'vi', confidence: 0.95 });
    engine.annotateBatch.mockResolvedValue(['I still love you']);
    store.init([{ time: 0, text: 'Anh vẫn yêu em' }]);
    await flush();
    store.setActiveLine(0);
    await flush();
    await flush();
    const map = read<Record<number, any>>(store.annotationByIndex$);
    expect(map[0]).toEqual({ text: 'Anh vẫn yêu em', annotation: 'I still love you', status: 'done' });
    // Availability and the engine come from the Translator API, not the Prompt API.
    expect(ai.checkTranslatorAvailability).toHaveBeenCalledWith('vi', 'en');
    expect(ai.getTranslatorEngine).toHaveBeenCalledWith({
      id: 'vi-en',
      sourceLanguage: 'vi',
      targetLanguage: 'en'
    });
    expect(ai.checkAvailability).not.toHaveBeenCalled();
    expect(ai.getPromptEngine).not.toHaveBeenCalled();
  });

  it('stays silent for Vietnamese when the Translator pair is unavailable', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'vi', confidence: 0.95 });
    ai.checkTranslatorAvailability.mockResolvedValue('unavailable');
    store.init([{ time: 0, text: 'Anh vẫn yêu em' }]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(read<string | null>(store.pageStatusText$)).toBeNull();
    expect(ai.getTranslatorEngine).not.toHaveBeenCalled();
  });

  it('still detects when only the Translator API is present (Prompt API missing)', async () => {
    ai.isPromptApiAvailable.mockReturnValue(false);
    ai.detectLanguage.mockResolvedValue({ lang: 'vi', confidence: 0.95 });
    store.init([{ time: 0, text: 'Anh vẫn yêu em' }]);
    await flush();
    expect(ai.detectLanguage).toHaveBeenCalled();
    expect(ai.checkTranslatorAvailability).toHaveBeenCalledWith('vi', 'en');
  });

  it('stays silent when detection matches an annotator but no lines qualify (already-romanized lyrics)', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'ja', confidence: 0.9 });
    store.init([
      { time: 0, text: 'Furubita omoide no hokori wo harau' },
      { time: 1, text: 'kaerou kaerou to' }
    ]);
    await flush();
    expect(read<string | null>(store.pageStatusText$)).toBeNull();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(ai.getPromptEngine).not.toHaveBeenCalled();
  });

  it('reports the romaji preparing label for a Japanese song', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'ja', confidence: 0.9 });
    store.init([{ time: 0, text: 'ありがとう' }]);
    await flush();
    expect(read<string | null>(store.pageStatusText$)).toBe('Preparing romaji…');
  });

  it('warms the session as soon as the annotator is matched, before any drain', async () => {
    store.init([{ time: 0, text: '你好' }]);
    await flush();
    expect(ai.getPromptEngine).toHaveBeenCalledWith(expect.objectContaining({ id: 'pinyin' }));
    expect(engine.ensureReady).toHaveBeenCalled();
    expect(engine.annotateBatch).not.toHaveBeenCalled();
  });
});

describe('LyricsAnnotationStore — windowing, queue, cache', () => {
  let store: LyricsAnnotationStore;
  let engine: ReturnType<typeof makeEngine>;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isTranslatorApiAvailable: jest.Mock;
    checkTranslatorAvailability: jest.Mock;
    getTranslatorEngine: jest.Mock;
    isDetectorAvailable: jest.Mock;
    checkAvailability: jest.Mock;
    detectLanguage: jest.Mock;
    getPromptEngine: jest.Mock;
  };
  let lyrics$: BehaviorSubject<LyricLine[] | null>;
  let isSynced$: BehaviorSubject<boolean>;
  let activeLine$: BehaviorSubject<number>;

  const read = <T>(obs: { pipe: any }): T => {
    let v!: T;
    (obs as any).pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  const LINES: LyricLine[] = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    text: `行${i}`
  }));

  beforeEach(async () => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    isSynced$ = new BehaviorSubject<boolean>(true);
    activeLine$ = new BehaviorSubject<number>(-1);
    engine = makeEngine();
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isTranslatorApiAvailable: jest.fn().mockReturnValue(true),
      checkTranslatorAvailability: jest.fn().mockResolvedValue('available'),
      getTranslatorEngine: jest.fn(() => engine),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      checkAvailability: jest.fn().mockResolvedValue('available'),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      getPromptEngine: jest.fn(() => engine)
    };
    TestBed.configureTestingModule({
      providers: [
        LyricsAnnotationStore,
        { provide: BuiltInAiService, useValue: ai },
        { provide: LyricsStore, useValue: { lyrics$, isSynced$, activeLine$ } }
      ]
    });
    store = TestBed.inject(LyricsAnnotationStore);
    store.init(LINES);
    await flush();
    await flush();
  });

  it('every engine acquisition uses the annotator id, so the service cache dedupes', async () => {
    engine.annotateBatch.mockResolvedValue(Array(8).fill('pīn yīn'));
    store.setActiveLine(0);
    await flush();
    await flush();
    store.setActiveLine(5);
    await flush();
    await flush();
    expect(ai.getPromptEngine.mock.calls.length).toBeGreaterThan(0);
    expect(ai.getPromptEngine.mock.calls.every((c: any[]) => c[0].id === 'pinyin')).toBe(true);
  });

  it('only one annotateBatch in flight at a time (serial drain)', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    engine.annotateBatch.mockImplementation(() => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      return new Promise<string[]>((resolve) =>
        setTimeout(() => {
          inFlight--;
          resolve(Array(8).fill('pīn yīn'));
        }, 0)
      );
    });
    store.setActiveLine(0);
    store.setActiveLine(5);
    store.setActiveLine(10);
    await flush();
    await flush();
    await flush();
    await flush();
    expect(maxInFlight).toBe(1);
  });

  it('marks batch lines loading then done on success', async () => {
    engine.annotateBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setActiveLine(0);
    await flush();
    await flush();
    const map = read<Record<number, any>>(store.annotationByIndex$);
    const statuses = Object.values(map).map((v: any) => v.status);
    expect(statuses.some((s) => s === 'done')).toBe(true);
  });

  it('marks batch lines error on annotateBatch failure, others unaffected', async () => {
    // seed two batches worth of lines (20 lines → 2+ batches of 8)
    engine.annotateBatch
      .mockRejectedValueOnce(new Error('AI error'))
      .mockResolvedValue(Array(8).fill('pīn yīn'));
    store.setActiveLine(15); // windowEnd = 15+10 = 25, covers all 20 lines
    await flush();
    await flush();
    await flush();
    await flush();
    const map = read<Record<number, any>>(store.annotationByIndex$);
    const statuses = Object.values(map).map((v: any) => v.status);
    expect(statuses.some((s) => s === 'error')).toBe(true);
    expect(statuses.some((s) => s === 'done')).toBe(true);
  });

  it('done lines are not re-prompted (cache)', async () => {
    engine.annotateBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setActiveLine(0);
    await flush();
    await flush();
    const callCount = engine.annotateBatch.mock.calls.length;
    store.setActiveLine(0); // same window — nothing new to fetch
    await flush();
    await flush();
    expect(engine.annotateBatch).toHaveBeenCalledTimes(callCount);
  });

  it('does not drain when disabled', async () => {
    // init() already seeded and drained lines 0-10; only count new calls.
    engine.annotateBatch.mockClear();
    store.setEnabled(false);
    store.setActiveLine(15); // opens lines beyond the auto-seeded window
    await flush();
    await flush();
    expect(engine.annotateBatch).not.toHaveBeenCalled();
  });

  it('resumes draining when re-enabled', async () => {
    engine.annotateBatch.mockClear();
    engine.annotateBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setEnabled(false);
    store.setActiveLine(15);
    await flush();
    await flush();
    expect(engine.annotateBatch).not.toHaveBeenCalled();
    store.setEnabled(true);
    await flush();
    await flush();
    expect(engine.annotateBatch).toHaveBeenCalled();
  });

  it('downloadState$ becomes ready after a successful drain that creates the engine', async () => {
    engine.annotateBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setActiveLine(0);
    await flush();
    await flush();
    let state!: string;
    store.downloadState$.pipe(take(1)).subscribe((s) => (state = s));
    expect(state).toBe('ready');
  });

  it('passes onDownloadProgress to ensureReady and progress callback flips downloadState to downloading', async () => {
    // Warm-up in beforeEach's init() already called ensureReady — inspect that call.
    const capturedOpts = engine.ensureReady.mock.calls[0]?.[0] as
      | { onDownloadProgress?: () => void }
      | undefined;
    expect(typeof capturedOpts?.onDownloadProgress).toBe('function');
    // downloadState is 'ready' after the warm-up completed; invoking the
    // progress callback should flip it back to 'downloading'.
    capturedOpts?.onDownloadProgress?.();
    let state!: string;
    store.downloadState$.pipe(take(1)).subscribe((s) => (state = s));
    expect(state).toBe('downloading');
  });
});

describe('LyricsAnnotationStore — warm-up/drain shared session creation', () => {
  let store: LyricsAnnotationStore;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isTranslatorApiAvailable: jest.Mock;
    checkTranslatorAvailability: jest.Mock;
    getTranslatorEngine: jest.Mock;
    isDetectorAvailable: jest.Mock;
    checkAvailability: jest.Mock;
    detectLanguage: jest.Mock;
    getPromptEngine: jest.Mock;
  };
  let lyrics$: BehaviorSubject<LyricLine[] | null>;

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isTranslatorApiAvailable: jest.fn().mockReturnValue(true),
      checkTranslatorAvailability: jest.fn().mockResolvedValue('available'),
      getTranslatorEngine: jest.fn(),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      checkAvailability: jest.fn().mockResolvedValue('available'),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      getPromptEngine: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        LyricsAnnotationStore,
        { provide: BuiltInAiService, useValue: ai },
        { provide: LyricsStore, useValue: { lyrics$, isSynced$: of(true), activeLine$: of(-1) } }
      ]
    });
    store = TestBed.inject(LyricsAnnotationStore);
  });

  it('shares one session creation between the warm-up and drainQueue when they race on the same generation', async () => {
    // Emulates the service's real memoization (Task 3): every call while a
    // creation is in flight returns the SAME pending promise; `creations`
    // counts how many times a new one was actually started.
    let resolveReady!: () => void;
    let creations = 0;
    let readyPromise: Promise<void> | null = null;
    const engine = {
      ensureReady: jest.fn(() => {
        if (!readyPromise) {
          creations++;
          readyPromise = new Promise<void>((r) => (resolveReady = r));
        }
        return readyPromise;
      }),
      annotateBatch: jest.fn((b: string[]) => Promise.resolve(b.map(() => 'pīn yīn'))),
      destroy: jest.fn()
    };
    ai.getPromptEngine.mockReturnValue(engine);

    store.init([{ time: 0, text: '你好' }]);
    // Let detectAndSeed resolve detectLanguage + checkAvailability and reach
    // the warm-up's ensureReady call — flush() (a macrotask boundary) drains
    // every pending microtask first, so this lands exactly on "called once,
    // not yet resolved" without hand-counting Promise.resolve() ticks.
    await flush();
    // The warm-up and the line-0 seed both call ensureReady in this tick,
    // but the memoized promise means only one creation starts.
    expect(engine.ensureReady.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(creations).toBe(1);

    // drainQueue's prepareEngine call races the warm-up's: this.engine is
    // still null, so it calls ensureReady too — but gets the same pending
    // promise back rather than starting a second creation.
    store.setActiveLine(0);
    await flush();
    expect(creations).toBe(1);

    resolveReady();
    await flush();
    await flush();

    expect(creations).toBe(1); // both paths shared one LanguageModel.create()
    expect(engine.annotateBatch).toHaveBeenCalled(); // drain proceeded once ready
    let state!: string;
    store.downloadState$.pipe(take(1)).subscribe((s) => (state = s));
    expect(state).toBe('ready');
  });
});

describe('LyricsAnnotationStore — track change', () => {
  let store: LyricsAnnotationStore;
  let engine: any;
  let ai: any;
  let lyrics$: BehaviorSubject<LyricLine[] | null>;
  const lines = (n: number, tag: string): LyricLine[] =>
    Array.from({ length: n }, (_, i) => ({ time: i, text: `${tag}${i}汉` }));
  const read = <T>(obs: any): T => {
    let v!: T;
    obs.pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    engine = {
      ensureReady: jest.fn().mockResolvedValue(undefined),
      annotateBatch: jest.fn((b: string[]) => Promise.resolve(b.map((t) => 'py-' + t))),
      destroy: jest.fn()
    };
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isTranslatorApiAvailable: jest.fn().mockReturnValue(true),
      checkTranslatorAvailability: jest.fn().mockResolvedValue('available'),
      getTranslatorEngine: jest.fn(() => engine),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      checkAvailability: jest.fn().mockResolvedValue('available'),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      getPromptEngine: jest.fn(() => engine)
    };
    TestBed.configureTestingModule({
      providers: [
        LyricsAnnotationStore,
        { provide: BuiltInAiService, useValue: ai },
        { provide: LyricsStore, useValue: { lyrics$, isSynced$: of(true), activeLine$: of(-1) } }
      ]
    });
    store = TestBed.inject(LyricsAnnotationStore);
  });

  it('resets state but keeps the base session alive when the track changes', async () => {
    lyrics$.next(lines(10, 'a'));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush();
    expect(read<Record<number, any>>(store.annotationByIndex$)[0].status).toBe('done');

    lyrics$.next(lines(10, 'b'));
    await flush();
    expect(engine.destroy).not.toHaveBeenCalled();
    const map = read<Record<number, any>>(store.annotationByIndex$);
    // The new track seeds fresh entries. With a warm session and the line-0
    // seed they annotate in the same tick, no waiting for the first sung line.
    expect(map[0].text).toBe('b0汉');
    expect(map[0].annotation).toBe('py-b0汉');
  });

  it('does not stamp new track state with old track lines when detectLanguage resolves after track change', async () => {
    // Slow detectLanguage for trackA — resolves only when we manually tick
    let resolveDetect!: (v: { lang: string; confidence: number }) => void;
    const slowDetect = new Promise<{ lang: string; confidence: number }>((res) => { resolveDetect = res; });
    ai.detectLanguage.mockImplementationOnce(() => slowDetect);

    // Start init for trackA (detection is pending)
    lyrics$.next(lines(3, 'a'));
    // trackA's detectLanguage is now awaited but not resolved

    // Track changes to trackB BEFORE trackA's detection resolves
    ai.detectLanguage.mockResolvedValueOnce({ lang: 'zh', confidence: 0.95 });
    lyrics$.next(lines(3, 'b'));
    await flush(); // reset() + trackB's detectAndSeed completes synchronously

    // Now resolve trackA's stale detection
    resolveDetect({ lang: 'zh', confidence: 0.95 });
    await flush();
    await flush();

    // annotationByIndex must only contain 'b' lines — trackA must NOT have overwritten
    const map = read<Record<number, any>>(store.annotationByIndex$);
    const entries = Object.values(map) as Array<{ text: string }>;
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.text.startsWith('b'))).toBe(true);
  });

  it('does not write stale results into new track state when drain resolves after track change', async () => {
    // Slow first batch — resolves only when we manually tick
    let resolveSlow!: (v: string[]) => void;
    const slowBatch = new Promise<string[]>((res) => { resolveSlow = res; });
    engine.annotateBatch.mockImplementationOnce(() => slowBatch);

    lyrics$.next(lines(5, 'a'));
    await flush(); // detectAndSeed completes
    store.setActiveLine(0); // starts drainQueue, awaits the slow batch
    await flush(); // drainQueue is now suspended inside the slow await

    // Track changes BEFORE the slow batch resolves
    lyrics$.next(lines(5, 'b'));
    await flush(); // reset() is called; old engine is destroyed; new detectAndSeed seeds 'b' lines

    // Now resolve the old slow batch (simulates AI returning late)
    resolveSlow(Array(5).fill('stale-py'));
    await flush();
    await flush();

    // New track's annotationByIndex must only contain 'b' lines — no stale 'a' data
    const map = read<Record<number, any>>(store.annotationByIndex$);
    const entries = Object.values(map) as Array<{ text: string; status: string; annotation: string | null }>;
    expect(entries.every((e) => e.text.startsWith('b'))).toBe(true);
    // No phantom 'done' entries carrying stale annotations
    expect(entries.every((e) => e.annotation !== 'stale-py')).toBe(true);
  });

  it('does not adopt (or destroy) an engine whose preparation finishes after a track change', async () => {
    // ensureReady must emulate the service's real memoization: the warm-up
    // and drainQueue both race on this.engine === null and each call
    // ensureReady, but they need to observe the SAME pending promise (one
    // creation), not two independent ones that only the second overwrites.
    let resolveReady!: () => void;
    let readyPromiseA: Promise<void> | null = null;
    const engineA = {
      ensureReady: jest.fn(() => {
        if (!readyPromiseA) {
          readyPromiseA = new Promise<void>((r) => (resolveReady = r));
        }
        return readyPromiseA;
      }),
      annotateBatch: jest.fn(),
      destroy: jest.fn()
    };
    const engineB = {
      ensureReady: jest.fn().mockResolvedValue(undefined),
      annotateBatch: jest.fn((b: string[]) => Promise.resolve(b.map(() => 'rōmaji'))),
      destroy: jest.fn()
    };
    ai.getPromptEngine.mockImplementation((spec: { id: string }) =>
      spec.id === 'romaji' ? engineB : engineA
    );

    lyrics$.next(lines(3, 'a'));            // zh track; warm-up starts, engineA pending
    await flush();
    store.setActiveLine(0);                  // drain also waits on engineA
    await flush();

    ai.detectLanguage.mockResolvedValueOnce({ lang: 'ja', confidence: 0.9 });
    lyrics$.next([{ time: 0, text: 'ありがとう' }]);  // ja track before engineA is ready
    await flush();

    resolveReady();                          // stale zh preparation finishes late
    await flush();
    store.setActiveLine(0);
    await flush();
    await flush();

    expect(engineA.destroy).not.toHaveBeenCalled();   // base session survives for the next zh track
    expect(engineA.annotateBatch).not.toHaveBeenCalled();
    expect(engineB.annotateBatch).toHaveBeenCalled();  // ja track uses its own engine
  });
});

describe('LyricsAnnotationStore — toggle visibility and page status', () => {
  let store: LyricsAnnotationStore;
  let engine: ReturnType<typeof makeEngine>;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isTranslatorApiAvailable: jest.Mock;
    checkTranslatorAvailability: jest.Mock;
    getTranslatorEngine: jest.Mock;
    isDetectorAvailable: jest.Mock;
    checkAvailability: jest.Mock;
    detectLanguage: jest.Mock;
    getPromptEngine: jest.Mock;
  };
  let lyrics$: BehaviorSubject<LyricLine[] | null>;
  let isSynced$: BehaviorSubject<boolean>;
  let activeLine$: BehaviorSubject<number>;

  const read = <T>(obs: { pipe: any }): T => {
    let v!: T;
    (obs as any).pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  const LINES: LyricLine[] = Array.from({ length: 5 }, (_, i) => ({ time: i, text: `行${i}` }));

  const configure = () => {
    TestBed.configureTestingModule({
      providers: [
        LyricsAnnotationStore,
        { provide: BuiltInAiService, useValue: ai },
        { provide: LyricsStore, useValue: { lyrics$, isSynced$, activeLine$ } }
      ]
    });
    store = TestBed.inject(LyricsAnnotationStore);
  };

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    isSynced$ = new BehaviorSubject<boolean>(true);
    activeLine$ = new BehaviorSubject<number>(-1);
    engine = makeEngine();
    engine.annotateBatch.mockResolvedValue(Array(8).fill('pīn yīn'));
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isTranslatorApiAvailable: jest.fn().mockReturnValue(true),
      checkTranslatorAvailability: jest.fn().mockResolvedValue('available'),
      getTranslatorEngine: jest.fn(() => engine),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      checkAvailability: jest.fn().mockResolvedValue('available'),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      getPromptEngine: jest.fn(() => engine)
    };
  });

  it('hides the toggle and reports "preparing" before any pinyin renders', async () => {
    // The line-0 seed starts draining right away, so hold the first batch
    // open to catch the state before anything renders.
    engine.annotateBatch.mockReturnValue(new Promise(() => undefined));
    configure();
    store.init(LINES);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(read<string | null>(store.pageStatusText$)).toBe('Preparing pinyin…');
  });

  it('shows the toggle and clears page status once a line renders pinyin', async () => {
    configure();
    store.init(LINES);
    await flush();
    store.setActiveLine(0);
    await flush();
    await flush();
    expect(read<boolean>(store.hasRenderedAnnotation$)).toBe(true);
    expect(read<boolean>(store.showToggle$)).toBe(true);
    expect(read<string | null>(store.pageStatusText$)).toBeNull();
  });

  it('reports no page status for a non-Chinese song', async () => {
    ai.detectLanguage.mockResolvedValue({ lang: 'en', confidence: 0.99 });
    configure();
    store.init([{ time: 0, text: 'hello' }]);
    await flush();
    expect(read<string | null>(store.pageStatusText$)).toBeNull();
    expect(read<boolean>(store.showToggle$)).toBe(false);
  });

  it('reports "downloading" while the model is being fetched', async () => {
    // Hold engine preparation open so downloadState stays "downloading".
    engine.ensureReady.mockReturnValue(new Promise(() => undefined));
    configure();
    store.init(LINES);
    await flush();
    store.setActiveLine(0);
    await flush();
    expect(read<string | null>(store.pageStatusText$)).toBe('Downloading language model…');
    expect(read<boolean>(store.showToggle$)).toBe(false);
  });

  it('seeds an initial window around the active line even while paused (no manual drive)', async () => {
    activeLine$.next(2); // paused mid-song with line 2 active
    configure();
    store.init(LINES);
    await flush(); // detection resolves
    await flush(); // engine + drain
    await flush();
    expect(read<boolean>(store.hasRenderedAnnotation$)).toBe(true);
    expect(read<boolean>(store.showToggle$)).toBe(true);
  });

  it('seeds the first window at line 0 during a synced intro (activeLine still -1)', async () => {
    // Regression: songs with a long instrumental intro report activeLine -1
    // until the first sung line, and the viewport observer only covers
    // unsynced lyrics. Nothing annotated for the whole intro, so the first
    // pinyin showed up ~30s after the track change even with a warm session.
    // The store must open the window at line 0 instead of waiting.
    configure();
    store.init(LINES);
    await flush();
    await flush();
    expect(engine.annotateBatch).toHaveBeenCalled();
    expect(engine.annotateBatch.mock.calls[0][0]).toEqual(LINES.map((l) => l.text));
    expect(read<boolean>(store.hasRenderedAnnotation$)).toBe(true);
  });

  it('does not seed a window for unsynced lyrics — the viewport observer drives them', async () => {
    isSynced$.next(false);
    configure();
    store.init(LINES);
    await flush();
    await flush();
    expect(engine.annotateBatch).not.toHaveBeenCalled();
    // The viewport observer remains the driver: a visible range triggers the fetch.
    store.setVisibleRange({ start: 0, end: 2 });
    await flush();
    await flush();
    expect(engine.annotateBatch).toHaveBeenCalled();
  });
});
