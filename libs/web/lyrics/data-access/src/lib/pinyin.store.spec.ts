import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { BuiltInAiService } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { LyricsStore } from './lyrics.store';
import { PinyinStore } from './pinyin.store';
import { LyricLine } from './lyrics.models';
import { BATCH_SIZE, LOOKAHEAD } from './pinyin.models';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('PinyinStore — detection gating', () => {
  let store: PinyinStore;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isDetectorAvailable: jest.Mock;
    detectLanguage: jest.Mock;
    createPinyinSession: jest.Mock;
    promptPinyinBatch: jest.Mock;
  };
  let lyrics$: BehaviorSubject<LyricLine[] | null>;

  const read = <T>(obs: { pipe: any }): T => {
    let v!: T;
    (obs as any).pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      createPinyinSession: jest.fn().mockResolvedValue({ prompt: jest.fn(), destroy: jest.fn() }),
      promptPinyinBatch: jest.fn().mockResolvedValue([])
    };
    TestBed.configureTestingModule({
      providers: [
        PinyinStore,
        { provide: BuiltInAiService, useValue: ai },
        { provide: LyricsStore, useValue: { lyrics$, isSynced$: of(true), activeLine$: of(-1) } }
      ]
    });
    store = TestBed.inject(PinyinStore);
  });

  it('marks support unsupported and stays silent when Prompt API is missing', async () => {
    ai.isPromptApiAvailable.mockReturnValue(false);
    store.init([{ time: 0, text: '你好' }]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(false);
    expect(ai.detectLanguage).not.toHaveBeenCalled();
  });

  it('shows the toggle and seeds pending entries only for Han lines when Chinese', async () => {
    store.init([
      { time: 0, text: '你好' },
      { time: 1, text: 'instrumental break' },
      { time: 2, text: '再见' }
    ]);
    await flush();
    expect(read<boolean>(store.showToggle$)).toBe(true);
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    expect(Object.keys(map)).toEqual(['0', '2']);
    expect(map[0]).toEqual({ text: '你好', pinyin: null, status: 'pending' });
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
});

describe('PinyinStore — windowing, serial batch queue, and index cache', () => {
  let store: PinyinStore;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isDetectorAvailable: jest.Mock;
    detectLanguage: jest.Mock;
    createPinyinSession: jest.Mock;
    promptPinyinBatch: jest.Mock;
  };
  let lyrics$: BehaviorSubject<LyricLine[] | null>;
  let mockSession: { prompt: jest.Mock; destroy: jest.Mock };

  const read = <T>(obs: { pipe: any }): T => {
    let v!: T;
    (obs as any).pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  // Build N Chinese lines, all seeded as pending
  function makeLines(count: number): LyricLine[] {
    return Array.from({ length: count }, (_, i) => ({ time: i * 1000, text: `汉字${i}` }));
  }

  beforeEach(async () => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    mockSession = { prompt: jest.fn(), destroy: jest.fn() };
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      createPinyinSession: jest.fn().mockResolvedValue(mockSession),
      promptPinyinBatch: jest.fn().mockResolvedValue([])
    };
    TestBed.configureTestingModule({
      providers: [
        PinyinStore,
        { provide: BuiltInAiService, useValue: ai },
        { provide: LyricsStore, useValue: { lyrics$, isSynced$: of(true), activeLine$: of(-1) } }
      ]
    });
    store = TestBed.inject(PinyinStore);
    // Seed 30 Chinese lines
    store.init(makeLines(30));
    await flush();
  });

  it('setVisibleRange stores the range in state', () => {
    store.setVisibleRange(5, 10);
    const s = read<{ start: number; end: number } | null>(store.visibleRange$);
    expect(s).toEqual({ start: 5, end: 10 });
  });

  it('setVisibleRange triggers fetch only for lines within [start .. end + LOOKAHEAD]', async () => {
    // promptPinyinBatch returns the correct number of pinyin strings
    ai.promptPinyinBatch.mockImplementation((_session: unknown, lines: string[]) =>
      Promise.resolve(lines.map(() => 'pīnyīn'))
    );
    store.setVisibleRange(0, 2);
    // Drain all microtasks/macrotasks
    await flush();
    await flush();
    // Lines fetched: indices 0..2+LOOKAHEAD (inclusive), batch size BATCH_SIZE
    // Only indices that were pending should be fetched
    const totalExpected = Math.min(3 + LOOKAHEAD, 30); // start=0, end=2, so 0..2+LOOKAHEAD
    const totalCalls = (ai.promptPinyinBatch as jest.Mock).mock.calls.reduce(
      (sum: number, call: unknown[]) => sum + (call[1] as string[]).length,
      0
    );
    expect(totalCalls).toBe(totalExpected);
  });

  it('does not fetch lines outside the window + lookahead', async () => {
    ai.promptPinyinBatch.mockImplementation((_session: unknown, lines: string[]) =>
      Promise.resolve(lines.map(() => 'pīnyīn'))
    );
    store.setVisibleRange(0, 0);
    await flush();
    await flush();
    const fetched = (ai.promptPinyinBatch as jest.Mock).mock.calls.reduce(
      (sum: number, call: unknown[]) => sum + (call[1] as string[]).length,
      0
    );
    // window end = 0, lookahead = LOOKAHEAD → fetch 0..LOOKAHEAD inclusive
    expect(fetched).toBe(1 + LOOKAHEAD);
  });

  it('skips lines that are already done (index cache)', async () => {
    // Manually mark lines 0..4 as done before triggering a window update
    ai.promptPinyinBatch.mockImplementation((_session: unknown, lines: string[]) =>
      Promise.resolve(lines.map(() => 'pīnyīn'))
    );
    // First window: fetch lines 0..LOOKAHEAD
    store.setVisibleRange(0, 0);
    await flush();
    await flush();
    const firstCallCount = (ai.promptPinyinBatch as jest.Mock).mock.calls.reduce(
      (sum: number, call: unknown[]) => sum + (call[1] as string[]).length,
      0
    );

    // Second window overlaps: should NOT re-fetch already-done lines
    (ai.promptPinyinBatch as jest.Mock).mockClear();
    store.setVisibleRange(0, 0);
    await flush();
    await flush();
    const secondCallCount = (ai.promptPinyinBatch as jest.Mock).mock.calls.reduce(
      (sum: number, call: unknown[]) => sum + (call[1] as string[]).length,
      0
    );

    expect(firstCallCount).toBeGreaterThan(0);
    expect(secondCallCount).toBe(0); // all already done — cache hit
  });

  it('processes lines in serial batches of BATCH_SIZE', async () => {
    let resolvers: Array<() => void> = [];
    ai.promptPinyinBatch.mockImplementation((_session: unknown, lines: string[]) =>
      new Promise<string[]>((resolve) => {
        resolvers.push(() => resolve(lines.map(() => 'pīnyīn')));
      })
    );

    store.setVisibleRange(0, BATCH_SIZE * 2); // enough lines for multiple batches
    await flush();

    // Only one batch should be in-flight at a time
    expect((ai.promptPinyinBatch as jest.Mock).mock.calls.length).toBe(1);

    // Resolve first batch
    resolvers[0]();
    resolvers = [];
    await flush();
    await flush();

    // Second batch should now be in flight
    expect((ai.promptPinyinBatch as jest.Mock).mock.calls.length).toBe(2);
  });

  it('marks fetched lines as done with the returned pinyin', async () => {
    ai.promptPinyinBatch.mockImplementation((_session: unknown, lines: string[]) =>
      Promise.resolve(lines.map((_, i) => `pinyin-${i}`))
    );
    store.setVisibleRange(0, 1);
    await flush();
    await flush();
    const map = read<Record<number, { pinyin: string | null; status: string }>>(
      store.pinyinByIndex$
    );
    expect(map[0].status).toBe('done');
    expect(map[0].pinyin).toBe('pinyin-0');
  });
});
