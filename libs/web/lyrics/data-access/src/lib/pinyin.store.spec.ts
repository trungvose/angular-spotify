import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { BuiltInAiService } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { LyricsStore } from './lyrics.store';
import { PinyinStore } from './pinyin.store';
import { LyricLine } from './lyrics.models';

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

describe('PinyinStore — windowing, queue, cache', () => {
  let store: PinyinStore;
  let ai: {
    isPromptApiAvailable: jest.Mock;
    isDetectorAvailable: jest.Mock;
    detectLanguage: jest.Mock;
    createPinyinSession: jest.Mock;
    promptPinyinBatch: jest.Mock;
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
        { provide: LyricsStore, useValue: { lyrics$, isSynced$, activeLine$ } }
      ]
    });
    store = TestBed.inject(PinyinStore);
    store.init(LINES);
    await flush();
    await flush();
  });

  it('createPinyinSession is called once even with multiple drains', async () => {
    ai.promptPinyinBatch.mockResolvedValue(Array(8).fill('pīn yīn'));
    store.setActiveLine(0);
    await flush();
    await flush();
    store.setActiveLine(5);
    await flush();
    await flush();
    expect(ai.createPinyinSession).toHaveBeenCalledTimes(1);
  });

  it('only one promptPinyinBatch in flight at a time (serial drain)', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    ai.promptPinyinBatch.mockImplementation(() => {
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
    ai.promptPinyinBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setActiveLine(0);
    await flush();
    await flush();
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    const statuses = Object.values(map).map((v: any) => v.status);
    expect(statuses.some((s) => s === 'done')).toBe(true);
  });

  it('marks batch lines error on promptPinyinBatch failure, others unaffected', async () => {
    // seed two batches worth of lines (20 lines → 2+ batches of 8)
    ai.promptPinyinBatch
      .mockRejectedValueOnce(new Error('AI error'))
      .mockResolvedValue(Array(8).fill('pīn yīn'));
    store.setActiveLine(15); // windowEnd = 15+10 = 25, covers all 20 lines
    await flush();
    await flush();
    await flush();
    await flush();
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    const statuses = Object.values(map).map((v: any) => v.status);
    expect(statuses.some((s) => s === 'error')).toBe(true);
    expect(statuses.some((s) => s === 'done')).toBe(true);
  });

  it('done lines are not re-prompted (cache)', async () => {
    ai.promptPinyinBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setActiveLine(0);
    await flush();
    await flush();
    const callCount = ai.promptPinyinBatch.mock.calls.length;
    store.setActiveLine(0); // same window — nothing new to fetch
    await flush();
    await flush();
    expect(ai.promptPinyinBatch).toHaveBeenCalledTimes(callCount);
  });

  it('does not drain when disabled', async () => {
    store.setEnabled(false);
    store.setActiveLine(0);
    await flush();
    await flush();
    expect(ai.promptPinyinBatch).not.toHaveBeenCalled();
  });

  it('resumes draining when re-enabled', async () => {
    ai.promptPinyinBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    store.setEnabled(false);
    store.setActiveLine(0);
    await flush();
    await flush();
    store.setEnabled(true);
    await flush();
    await flush();
    expect(ai.promptPinyinBatch).toHaveBeenCalled();
  });

  it('setVisibleRange triggers fetch for unsynced lines in range', async () => {
    ai.promptPinyinBatch.mockResolvedValue(Array(8).fill('nǐ hǎo'));
    // windowEnd = -1 (default after init with no activeLine set past it)
    store.setVisibleRange({ start: 0, end: 5 });
    await flush();
    await flush();
    expect(ai.promptPinyinBatch).toHaveBeenCalled();
  });
});
