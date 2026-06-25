# Pinyin Lyrics via Chrome Built-in AI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render tone-marked Hanyu Pinyin above Chinese lyric lines, generated on-device by Chrome's built-in AI, progressively and playback-aware.

**Architecture:** A new reusable `BuiltInAiService` (the only code touching the global `LanguageModel`/`LanguageDetector` APIs) sits in a shared data-access lib. A dedicated `PinyinStore` (NgRx ComponentStore) subscribes to the existing `LyricsStore`, detects Chinese, and drains a serial batch queue windowed around the active playback line (or viewport for unsynced lyrics), holding results in an in-memory per-line map. The lyrics view renders pinyin above each line; a new toggle hides/shows it. Pinyin is purely additive — any failure degrades to today's plain lyrics.

**Tech Stack:** Angular (standalone NgModules), NgRx ComponentStore, RxJS, Nx, Jest (`testEnvironment: node`), ng-zorro, `@ngneat/svg-icon`.

## Global Constraints

- Build only against the **global** APIs `LanguageModel` and `LanguageDetector` (feature-detected via `typeof globalThis[name] !== 'undefined'`). Never use legacy `window.ai`.
- `LyricLine` (`{ time: number | null; text: string }`) stays unchanged — pinyin lives in `PinyinStore`, never on `LyricLine`.
- Pinyin cache is **in-memory for the session only**. No localStorage/IndexedDB this iteration.
- Feature is **additive**: if anything is unsupported or fails, the lyrics view must behave exactly as it does today.
- Pinyin system prompt (verbatim from the validated POC): `You are a precise Chinese-to-Hanyu-Pinyin transliterator. Output pinyin WITH tone marks (ā á ǎ à). Do not translate meaning.`
- Tunables exported as named constants: `LOOKAHEAD = 10`, `PREFETCH_MARGIN = 3`, `BATCH_SIZE = 8`, `MIN_CONFIDENCE = 0.5`, `DETECT_SAMPLE_LINES = 5`.
- Follow existing test style: `TestBed.configureTestingModule` with dependencies provided via `{ provide, useValue }` jest mocks (see `libs/web/shared/data-access/store/src/lib/saved-tracks/saved-tracks.store.spec.ts`).
- All commits use Conventional Commits.

---

## File Structure

**New lib — `libs/web/shared/data-access/built-in-ai`:**
- `src/lib/built-in-ai.types.ts` — ambient global typings + public interfaces.
- `src/lib/built-in-ai.service.ts` — `BuiltInAiService`.
- `src/lib/built-in-ai.service.spec.ts` — unit tests.
- `src/index.ts` — barrel.
- `project.json`, `jest.config.ts`, `tsconfig*.json`, `.eslintrc.json` — Nx scaffold.

**Modified/added in `libs/web/lyrics/data-access`:**
- `src/lib/pinyin.models.ts` — `PinyinLineState`, `PinyinState`, constants (NEW).
- `src/lib/han-util.ts` — `containsHan` (NEW).
- `src/lib/pinyin.store.ts` — `PinyinStore` (NEW).
- `src/lib/han-util.spec.ts`, `src/lib/pinyin.store.spec.ts` (NEW).
- `src/index.ts` — export the new symbols (MODIFY).

**Modified/added in `libs/web/lyrics/ui`:**
- `lyrics-toggle/...` mirrored into new `pinyin-toggle/...` (NEW component + module + spec).
- `lyrics-view/src/lib/lyrics-view.component.ts|html|scss` — render pinyin + viewport reporting (MODIFY).
- `lyrics-view/src/lib/lyrics-view.component.spec.ts` (NEW).

**Modified in `libs/web/lyrics/feature`:**
- `src/lib/lyrics.component.ts|html`, `src/lib/lyrics.module.ts` — wire `PinyinStore` + toggle (MODIFY).

---

## Task 1: Scaffold the `built-in-ai` shared lib with public types

**Files:**
- Create: `libs/web/shared/data-access/built-in-ai/*` (via Nx generator)
- Create: `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.types.ts`
- Modify: `tsconfig.base.json` (path mapping — generator usually adds it; verify)

**Interfaces:**
- Produces:
  ```ts
  export type AiAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';
  export interface LanguageDetectionResult { lang: string; confidence: number; }
  export interface PinyinSession { prompt(input: string, opts?: { signal?: AbortSignal }): Promise<string>; destroy(): void; }
  export interface CreateSessionOptions { onDownloadProgress?: (loaded: number) => void; signal?: AbortSignal; }
  ```

- [ ] **Step 1: Generate the library**

Run:
```bash
npx nx g @nx/angular:library --name=built-in-ai --directory=libs/web/shared/data-access/built-in-ai --importPath=@angular-spotify/web/shared/data-access/built-in-ai --tags=type:data-access,scope:web --standalone --skipModule --unitTestRunner=jest --style=none --no-interactive
```
Expected: creates the lib with `project.json`, `jest.config.ts`, `src/index.ts`, and adds the path to `tsconfig.base.json`.

- [ ] **Step 2: Verify the path mapping exists**

Run: `grep -n "web/shared/data-access/built-in-ai" tsconfig.base.json`
Expected: a line mapping `@angular-spotify/web/shared/data-access/built-in-ai` → `libs/web/shared/data-access/built-in-ai/src/index.ts`. If missing, add it next to the other `web/shared/data-access/*` entries.

- [ ] **Step 3: Write the public types**

Create `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.types.ts`:
```ts
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
  var LanguageModel: {
    availability(): Promise<AiAvailability>;
    create(options?: {
      initialPrompts?: { role: 'system' | 'user'; content: string }[];
      monitor?: (m: { addEventListener(type: 'downloadprogress', cb: (e: { loaded: number }) => void): void }) => void;
      signal?: AbortSignal;
    }): Promise<PinyinSession>;
  } | undefined;

  // eslint-disable-next-line no-var
  var LanguageDetector: {
    availability(): Promise<AiAvailability>;
    create(): Promise<{ detect(text: string): Promise<{ detectedLanguage: string; confidence: number }[]> }>;
  } | undefined;
}
```

- [ ] **Step 4: Replace the generated barrel**

Overwrite `libs/web/shared/data-access/built-in-ai/src/index.ts`:
```ts
export * from './lib/built-in-ai.types';
export * from './lib/built-in-ai.service';
```
(`built-in-ai.service` is created in Task 2. To keep this task compiling on its own, temporarily export only the types line, then add the service line in Task 2 Step 7.)

For now:
```ts
export * from './lib/built-in-ai.types';
```
Delete any generated placeholder `*.ts`/`*.spec.ts` the generator created in `src/lib/` (e.g. `built-in-ai.ts`).

- [ ] **Step 5: Verify the lib type-checks**

Run: `npx nx lint web-shared-data-access-built-in-ai`
Expected: PASS (no lint errors). The exact project name is the `name` field in the generated `project.json` — confirm with `cat libs/web/shared/data-access/built-in-ai/project.json`.

- [ ] **Step 6: Commit**

```bash
git add libs/web/shared/data-access/built-in-ai tsconfig.base.json
git commit -m "feat(built-in-ai): scaffold shared lib and public types"
```

---

## Task 2: BuiltInAiService — feature detection + language detection

**Files:**
- Create: `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.service.ts`
- Test: `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.service.spec.ts`
- Modify: `libs/web/shared/data-access/built-in-ai/src/index.ts`

**Interfaces:**
- Consumes: types from Task 1.
- Produces:
  ```ts
  @Injectable({ providedIn: 'root' })
  class BuiltInAiService {
    isPromptApiAvailable(): boolean;
    isDetectorAvailable(): boolean;
    detectLanguage(text: string): Promise<LanguageDetectionResult | null>;
  }
  ```

- [ ] **Step 1: Write the failing tests**

Create `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.service.spec.ts`:
```ts
import { BuiltInAiService } from './built-in-ai.service';

describe('BuiltInAiService — detection', () => {
  let service: BuiltInAiService;

  afterEach(() => {
    (globalThis as any).LanguageModel = undefined;
    (globalThis as any).LanguageDetector = undefined;
  });

  beforeEach(() => {
    service = new BuiltInAiService();
  });

  it('isPromptApiAvailable reflects the global', () => {
    (globalThis as any).LanguageModel = undefined;
    expect(service.isPromptApiAvailable()).toBe(false);
    (globalThis as any).LanguageModel = { availability: jest.fn(), create: jest.fn() };
    expect(service.isPromptApiAvailable()).toBe(true);
  });

  it('isDetectorAvailable reflects the global', () => {
    (globalThis as any).LanguageDetector = undefined;
    expect(service.isDetectorAvailable()).toBe(false);
    (globalThis as any).LanguageDetector = { availability: jest.fn(), create: jest.fn() };
    expect(service.isDetectorAvailable()).toBe(true);
  });

  it('detectLanguage returns the top result mapped to {lang, confidence}', async () => {
    const detect = jest.fn().mockResolvedValue([
      { detectedLanguage: 'zh', confidence: 0.92 },
      { detectedLanguage: 'en', confidence: 0.05 }
    ]);
    (globalThis as any).LanguageDetector = { create: jest.fn().mockResolvedValue({ detect }) };
    const result = await service.detectLanguage('你好');
    expect(result).toEqual({ lang: 'zh', confidence: 0.92 });
  });

  it('detectLanguage returns null when the detector is unavailable', async () => {
    (globalThis as any).LanguageDetector = undefined;
    expect(await service.detectLanguage('你好')).toBeNull();
  });

  it('detectLanguage returns null when detection throws', async () => {
    (globalThis as any).LanguageDetector = {
      create: jest.fn().mockRejectedValue(new Error('boom'))
    };
    expect(await service.detectLanguage('你好')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx nx test web-shared-data-access-built-in-ai`
Expected: FAIL — `Cannot find module './built-in-ai.service'`.

- [ ] **Step 3: Write the minimal implementation**

Create `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.service.ts`:
```ts
import { Injectable } from '@angular/core';
import { LanguageDetectionResult } from './built-in-ai.types';

@Injectable({ providedIn: 'root' })
export class BuiltInAiService {
  isPromptApiAvailable(): boolean {
    return typeof globalThis.LanguageModel !== 'undefined';
  }

  isDetectorAvailable(): boolean {
    return typeof globalThis.LanguageDetector !== 'undefined';
  }

  async detectLanguage(text: string): Promise<LanguageDetectionResult | null> {
    if (!this.isDetectorAvailable()) {
      return null;
    }
    try {
      const detector = await globalThis.LanguageDetector!.create();
      const results = await detector.detect(text);
      const top = results[0];
      return top ? { lang: top.detectedLanguage, confidence: top.confidence } : null;
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx test web-shared-data-access-built-in-ai`
Expected: PASS (5 tests).

- [ ] **Step 5: Export the service from the barrel**

Edit `libs/web/shared/data-access/built-in-ai/src/index.ts` to:
```ts
export * from './lib/built-in-ai.types';
export * from './lib/built-in-ai.service';
```

- [ ] **Step 6: Commit**

```bash
git add libs/web/shared/data-access/built-in-ai
git commit -m "feat(built-in-ai): add feature detection and language detection"
```

---

## Task 3: BuiltInAiService — session creation + batched pinyin prompt

**Files:**
- Modify: `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.service.ts`
- Test: `libs/web/shared/data-access/built-in-ai/src/lib/built-in-ai.service.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  PINYIN_SYSTEM_PROMPT: string;
  createPinyinSession(opts?: CreateSessionOptions): Promise<PinyinSession>;
  promptPinyinBatch(session: PinyinSession, lines: string[], signal?: AbortSignal): Promise<string[]>;
  ```
  `promptPinyinBatch` returns one pinyin string per input line. It throws if the model output cannot be parsed into an array whose length equals `lines.length`.

- [ ] **Step 1: Write the failing tests** (append to the existing spec)

```ts
import { PinyinSession } from './built-in-ai.types';

describe('BuiltInAiService — pinyin', () => {
  let service: BuiltInAiService;
  afterEach(() => { (globalThis as any).LanguageModel = undefined; });
  beforeEach(() => { service = new BuiltInAiService(); });

  const fakeSession = (output: string): PinyinSession => ({
    prompt: jest.fn().mockResolvedValue(output),
    destroy: jest.fn()
  });

  it('createPinyinSession passes the system prompt and reports download progress', async () => {
    const create = jest.fn().mockImplementation((opts) => {
      opts.monitor?.({ addEventListener: (_t: string, cb: (e: { loaded: number }) => void) => cb({ loaded: 0.5 }) });
      return Promise.resolve(fakeSession('[]'));
    });
    (globalThis as any).LanguageModel = { create };
    const onDownloadProgress = jest.fn();
    await service.createPinyinSession({ onDownloadProgress });
    const passed = create.mock.calls[0][0];
    expect(passed.initialPrompts[0]).toEqual({ role: 'system', content: expect.stringContaining('Pinyin') });
    expect(onDownloadProgress).toHaveBeenCalledWith(0.5);
  });

  it('promptPinyinBatch parses a clean JSON array', async () => {
    const session = fakeSession('["nǐ hǎo", "zài jiàn"]');
    const result = await service.promptPinyinBatch(session, ['你好', '再见']);
    expect(result).toEqual(['nǐ hǎo', 'zài jiàn']);
  });

  it('promptPinyinBatch extracts a JSON array embedded in prose (regex fallback)', async () => {
    const session = fakeSession('Sure! Here you go:\n["nǐ hǎo", "zài jiàn"]\nHope that helps.');
    const result = await service.promptPinyinBatch(session, ['你好', '再见']);
    expect(result).toEqual(['nǐ hǎo', 'zài jiàn']);
  });

  it('promptPinyinBatch throws when the parsed length does not match the input', async () => {
    const session = fakeSession('["nǐ hǎo"]');
    await expect(service.promptPinyinBatch(session, ['你好', '再见'])).rejects.toThrow();
  });

  it('promptPinyinBatch throws when no array can be parsed', async () => {
    const session = fakeSession('I cannot do that.');
    await expect(service.promptPinyinBatch(session, ['你好'])).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx nx test web-shared-data-access-built-in-ai`
Expected: FAIL — `service.createPinyinSession is not a function`.

- [ ] **Step 3: Implement** (add to `built-in-ai.service.ts`)

Add the constant above the class:
```ts
export const PINYIN_SYSTEM_PROMPT =
  'You are a precise Chinese-to-Hanyu-Pinyin transliterator. ' +
  'Output pinyin WITH tone marks (ā á ǎ à). Do not translate meaning.';
```
Add the import and methods:
```ts
import { CreateSessionOptions, LanguageDetectionResult, PinyinSession } from './built-in-ai.types';

// inside the class:
async createPinyinSession(opts: CreateSessionOptions = {}): Promise<PinyinSession> {
  if (!this.isPromptApiAvailable()) {
    throw new Error('Prompt API unavailable');
  }
  return globalThis.LanguageModel!.create({
    initialPrompts: [{ role: 'system', content: PINYIN_SYSTEM_PROMPT }],
    signal: opts.signal,
    monitor: (m) =>
      m.addEventListener('downloadprogress', (e) => opts.onDownloadProgress?.(e.loaded))
  });
}

async promptPinyinBatch(
  session: PinyinSession,
  lines: string[],
  signal?: AbortSignal
): Promise<string[]> {
  const prompt =
    'Convert each line of this Chinese text to Hanyu Pinyin with tone marks. ' +
    'Return ONLY a JSON array of strings, one pinyin line per input line, no extra text.\n\n' +
    lines.join('\n');
  const raw = await session.prompt(prompt, { signal });
  const parsed = this.parseArray(raw);
  if (!parsed || parsed.length !== lines.length) {
    throw new Error(`Pinyin parse failed: expected ${lines.length} lines`);
  }
  return parsed;
}

private parseArray(raw: string): string[] | null {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    return null;
  }
  try {
    const value = JSON.parse(match[0]);
    return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx nx test web-shared-data-access-built-in-ai`
Expected: PASS (all detection + pinyin tests).

- [ ] **Step 5: Commit**

```bash
git add libs/web/shared/data-access/built-in-ai
git commit -m "feat(built-in-ai): add pinyin session and batched prompt parsing"
```

---

## Task 4: Han-detection util + pinyin models

**Files:**
- Create: `libs/web/lyrics/data-access/src/lib/han-util.ts`
- Create: `libs/web/lyrics/data-access/src/lib/pinyin.models.ts`
- Test: `libs/web/lyrics/data-access/src/lib/han-util.spec.ts`
- Modify: `libs/web/lyrics/data-access/src/index.ts`

**Interfaces:**
- Produces:
  ```ts
  containsHan(text: string): boolean;

  type PinyinStatus = 'pending' | 'loading' | 'done' | 'error';
  interface PinyinLineState { text: string; pinyin: string | null; status: PinyinStatus; }
  type PinyinSupport = 'unknown' | 'unsupported' | 'supported';
  type PinyinDownloadState = 'idle' | 'downloading' | 'ready';
  interface PinyinState {
    enabled: boolean;
    support: PinyinSupport;
    downloadState: PinyinDownloadState;
    isChinese: boolean;
    pinyinByIndex: Record<number, PinyinLineState>;
    windowEnd: number;
    visibleRange: { start: number; end: number } | null;
  }
  const LOOKAHEAD, PREFETCH_MARGIN, BATCH_SIZE, MIN_CONFIDENCE, DETECT_SAMPLE_LINES: number;
  ```

- [ ] **Step 1: Write the failing test**

Create `libs/web/lyrics/data-access/src/lib/han-util.spec.ts`:
```ts
import { containsHan } from './han-util';

describe('containsHan', () => {
  it('returns true for simplified and traditional Han characters', () => {
    expect(containsHan('月亮代表我的心')).toBe(true);
    expect(containsHan('愛')).toBe(true);
  });

  it('returns false for non-Han text', () => {
    expect(containsHan('hello world')).toBe(false);
    expect(containsHan('')).toBe(false);
    expect(containsHan('123 !@#')).toBe(false);
  });

  it('returns true for mixed lines containing any Han', () => {
    expect(containsHan('La la 月亮')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx nx test web-lyrics-data-access`
Expected: FAIL — `Cannot find module './han-util'`.

- [ ] **Step 3: Implement util and models**

Create `libs/web/lyrics/data-access/src/lib/han-util.ts`:
```ts
const HAN_REGEX = /[㐀-䶿一-鿿豈-﫿]/;

export function containsHan(text: string): boolean {
  return HAN_REGEX.test(text);
}
```

Create `libs/web/lyrics/data-access/src/lib/pinyin.models.ts`:
```ts
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
  windowEnd: number;
  visibleRange: { start: number; end: number } | null;
}

export const LOOKAHEAD = 10;
export const PREFETCH_MARGIN = 3;
export const BATCH_SIZE = 8;
export const MIN_CONFIDENCE = 0.5;
export const DETECT_SAMPLE_LINES = 5;
```

- [ ] **Step 4: Run to verify pass**

Run: `npx nx test web-lyrics-data-access`
Expected: PASS.

- [ ] **Step 5: Export from the barrel**

Edit `libs/web/lyrics/data-access/src/index.ts`, append:
```ts
export * from './lib/han-util';
export * from './lib/pinyin.models';
export * from './lib/pinyin.store';
```
(`pinyin.store` is created in Task 5; add that line now and it will resolve once Task 5 lands — or add it in Task 5 Step 6 if you want each task to compile in isolation.)

- [ ] **Step 6: Commit**

```bash
git add libs/web/lyrics/data-access
git commit -m "feat(lyrics): add Han detection util and pinyin models"
```

---

## Task 5: PinyinStore — detection gating and state initialization

**Files:**
- Create: `libs/web/lyrics/data-access/src/lib/pinyin.store.ts`
- Test: `libs/web/lyrics/data-access/src/lib/pinyin.store.spec.ts`

**Interfaces:**
- Consumes: `BuiltInAiService`, `LyricsStore` (`lyrics$`, `isSynced$`, `activeLine$`), models from Task 4.
- Produces:
  ```ts
  @Injectable({ providedIn: 'root' })
  class PinyinStore extends ComponentStore<PinyinState> {
    readonly enabled$: Observable<boolean>;
    readonly showToggle$: Observable<boolean>;       // isChinese && support === 'supported'
    readonly downloadState$: Observable<PinyinDownloadState>;
    readonly pinyinByIndex$: Observable<Record<number, PinyinLineState>>;
    init(lines: LyricLine[]): void;                  // async detection + state seed
    setEnabled(enabled: boolean): void;
  }
  ```
  `init` is called by the store's own subscription to `LyricsStore.lyrics$` (wired here), but is also directly callable from tests.

- [ ] **Step 1: Write the failing tests**

Create `libs/web/lyrics/data-access/src/lib/pinyin.store.spec.ts`:
```ts
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npx nx test web-lyrics-data-access`
Expected: FAIL — `Cannot find module './pinyin.store'`.

- [ ] **Step 3: Implement the store (detection + init only)**

Create `libs/web/lyrics/data-access/src/lib/pinyin.store.ts`:
```ts
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { BuiltInAiService } from '@angular-spotify/web/shared/data-access/built-in-ai';
import { Observable } from 'rxjs';
import { LyricsStore } from './lyrics.store';
import { LyricLine } from './lyrics.models';
import { containsHan } from './han-util';
import {
  DETECT_SAMPLE_LINES,
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
  constructor(private ai: BuiltInAiService, private lyricsStore: LyricsStore) {
    super(initialState);
    this.watchLyrics();
  }

  readonly enabled$ = this.select((s) => s.enabled);
  readonly downloadState$ = this.select((s) => s.downloadState);
  readonly pinyinByIndex$ = this.select((s) => s.pinyinByIndex);
  readonly showToggle$: Observable<boolean> = this.select(
    (s) => s.isChinese && s.support === 'supported'
  );

  setEnabled(enabled: boolean): void {
    this.patchState({ enabled });
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

  private reset(): void {
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npx nx test web-lyrics-data-access`
Expected: PASS (detection-gating tests + han-util).

- [ ] **Step 5: Ensure the barrel exports the store**

Confirm `libs/web/lyrics/data-access/src/index.ts` includes `export * from './lib/pinyin.store';` (added in Task 4). If you deferred it, add it now.

- [ ] **Step 6: Commit**

```bash
git add libs/web/lyrics/data-access
git commit -m "feat(lyrics): add PinyinStore detection gating and state seed"
```

---

## Task 6: PinyinStore — windowing, serial batch queue, index mapping, cache

**Files:**
- Modify: `libs/web/lyrics/data-access/src/lib/pinyin.store.ts`
- Test: `libs/web/lyrics/data-access/src/lib/pinyin.store.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  setActiveLine(index: number): void;            // synced driver
  setVisibleRange(range: { start: number; end: number }): void;  // unsynced driver
  ```
  Draining is serial: only one `promptPinyinBatch` runs at a time; batches cover up to `BATCH_SIZE` `pending` lines nearest the focus, within the window. `done` lines are never re-prompted. A length-mismatch error from the service marks that batch's lines `error` without corrupting other lines.

- [ ] **Step 1: Write the failing tests** (new describe block in the same spec)

```ts
describe('PinyinStore — windowing and queue', () => {
  let store: PinyinStore;
  let ai: any;
  let lyrics$: BehaviorSubject<LyricLine[] | null>;
  const flush = () => new Promise((r) => setTimeout(r, 0));

  const lines = (n: number): LyricLine[] =>
    Array.from({ length: n }, (_, i) => ({ time: i * 1000, text: `汉${i}` }));

  const read = <T>(obs: any): T => {
    let v!: T;
    obs.pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      createPinyinSession: jest.fn().mockResolvedValue({ prompt: jest.fn(), destroy: jest.fn() }),
      promptPinyinBatch: jest.fn((_s: any, batch: string[]) =>
        Promise.resolve(batch.map((t) => 'py-' + t))
      )
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

  it('creates the session once and translates the initial window around line 0', async () => {
    store.init(lines(30));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush();
    expect(ai.createPinyinSession).toHaveBeenCalledTimes(1);
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    expect(map[0].status).toBe('done');
    expect(map[0].pinyin).toBe('py-汉0');
    // LOOKAHEAD=10 → lines 0..10 done; line 20 not yet
    expect(map[10].status).toBe('done');
    expect(map[20].status).toBe('pending');
  });

  it('extends the window forward as the active line advances', async () => {
    store.init(lines(40));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush();
    store.setActiveLine(15);
    await flush(); await flush();
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    expect(map[25].status).toBe('done'); // 15 + LOOKAHEAD
  });

  it('never re-prompts lines already done (cache)', async () => {
    store.init(lines(15));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush();
    const callsAfterFirst = ai.promptPinyinBatch.mock.calls.length;
    store.setActiveLine(1); // window barely moves; lines already done
    await flush(); await flush();
    const promptedTexts = ai.promptPinyinBatch.mock.calls.flatMap((c: any[]) => c[1]);
    expect(new Set(promptedTexts).size).toBe(promptedTexts.length); // no duplicates
    expect(ai.promptPinyinBatch.mock.calls.length).toBeGreaterThanOrEqual(callsAfterFirst);
  });

  it('drains serially — only one batch in flight at a time', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    ai.promptPinyinBatch = jest.fn((_s: any, batch: string[]) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      return new Promise((resolve) =>
        setTimeout(() => {
          inFlight--;
          resolve(batch.map((t) => 'py-' + t));
        }, 0)
      );
    });
    store.init(lines(30));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush(); await flush(); await flush();
    expect(maxInFlight).toBe(1);
  });

  it('marks a batch error on length mismatch without corrupting other lines', async () => {
    ai.promptPinyinBatch = jest.fn().mockRejectedValue(new Error('parse failed'));
    store.init(lines(5));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush();
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    expect(map[0].status).toBe('error');
    expect(map[0].pinyin).toBeNull();
  });

  it('does not run the model when disabled', async () => {
    store.init(lines(10));
    await flush();
    store.setEnabled(false);
    store.setActiveLine(0);
    await flush(); await flush();
    expect(ai.promptPinyinBatch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx nx test web-lyrics-data-access`
Expected: FAIL — `store.setActiveLine is not a function`.

- [ ] **Step 3: Implement windowing + serial queue**

Add to `PinyinStore` (imports first):
```ts
import { BATCH_SIZE, LOOKAHEAD, PREFETCH_MARGIN /* + existing */ } from './pinyin.models';
import { PinyinSession } from '@angular-spotify/web/shared/data-access/built-in-ai';
```
Add private fields and methods:
```ts
private session: PinyinSession | null = null;
private draining = false;
private focus = 0;

setActiveLine(index: number): void {
  this.focus = index;
  const desiredEnd = index + LOOKAHEAD;
  const { windowEnd } = this.get();
  // extend when the frontier comes within PREFETCH_MARGIN of the edge, or window unset
  if (windowEnd < 0 || desiredEnd > windowEnd - PREFETCH_MARGIN) {
    this.patchState({ windowEnd: desiredEnd });
  }
  void this.drainQueue();
}

setVisibleRange(range: { start: number; end: number }): void {
  this.focus = range.start;
  this.patchState({ visibleRange: range, windowEnd: range.end });
  void this.drainQueue();
}

private nextBatch(): number[] {
  const { pinyinByIndex, windowEnd, visibleRange } = this.get();
  const within = (i: number): boolean =>
    visibleRange ? i >= visibleRange.start && i <= visibleRange.end : i <= windowEnd;
  const pending = Object.keys(pinyinByIndex)
    .map(Number)
    .filter((i) => within(i) && pinyinByIndex[i].status === 'pending')
    .sort((a, b) => Math.abs(a - this.focus) - Math.abs(b - this.focus));
  return pending.slice(0, BATCH_SIZE);
}

private async drainQueue(): Promise<void> {
  if (this.draining || !this.get().enabled) {
    return;
  }
  this.draining = true;
  try {
    while (this.get().enabled) {
      const batch = this.nextBatch();
      if (batch.length === 0) {
        break;
      }
      if (!this.session) {
        this.patchState({ downloadState: 'downloading' });
        this.session = await this.ai.createPinyinSession({
          onDownloadProgress: () => this.patchState({ downloadState: 'downloading' })
        });
        this.patchState({ downloadState: 'ready' });
      }
      this.patchMany(batch, { status: 'loading' });
      try {
        const texts = batch.map((i) => this.get().pinyinByIndex[i].text);
        const result = await this.ai.promptPinyinBatch(this.session, texts);
        const updated = { ...this.get().pinyinByIndex };
        batch.forEach((i, k) => {
          updated[i] = { ...updated[i], pinyin: result[k], status: 'done' };
        });
        this.patchState({ pinyinByIndex: updated });
      } catch {
        this.patchMany(batch, { status: 'error' });
      }
    }
  } finally {
    this.draining = false;
  }
}

private patchMany(indices: number[], patch: Partial<PinyinLineState>): void {
  const updated = { ...this.get().pinyinByIndex };
  indices.forEach((i) => (updated[i] = { ...updated[i], ...patch }));
  this.patchState({ pinyinByIndex: updated });
}
```
Also update `setEnabled` to resume draining when re-enabled:
```ts
setEnabled(enabled: boolean): void {
  this.patchState({ enabled });
  if (enabled) {
    void this.drainQueue();
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx nx test web-lyrics-data-access`
Expected: PASS (windowing + queue tests).

- [ ] **Step 5: Commit**

```bash
git add libs/web/lyrics/data-access
git commit -m "feat(lyrics): add windowing, serial batch queue, and cache to PinyinStore"
```

---

## Task 7: PinyinStore — cancellation on track change + active-line wiring

**Files:**
- Modify: `libs/web/lyrics/data-access/src/lib/pinyin.store.ts`
- Test: `libs/web/lyrics/data-access/src/lib/pinyin.store.spec.ts`

**Interfaces:**
- Produces: the store auto-subscribes to `LyricsStore.activeLine$` (synced) and calls `setActiveLine`. On track change (`lyrics$` emits a new array), the in-flight session is destroyed and state reset.

- [ ] **Step 1: Write the failing tests** (new describe block)

```ts
describe('PinyinStore — track change', () => {
  let store: PinyinStore;
  let ai: any;
  let lyrics$: BehaviorSubject<LyricLine[] | null>;
  const flush = () => new Promise((r) => setTimeout(r, 0));
  const lines = (n: number, tag: string): LyricLine[] =>
    Array.from({ length: n }, (_, i) => ({ time: i, text: `${tag}${i}汉` }));
  const read = <T>(obs: any): T => {
    let v!: T;
    obs.pipe(take(1)).subscribe((x: T) => (v = x));
    return v;
  };

  beforeEach(() => {
    lyrics$ = new BehaviorSubject<LyricLine[] | null>(null);
    const destroy = jest.fn();
    ai = {
      isPromptApiAvailable: jest.fn().mockReturnValue(true),
      isDetectorAvailable: jest.fn().mockReturnValue(true),
      detectLanguage: jest.fn().mockResolvedValue({ lang: 'zh', confidence: 0.95 }),
      createPinyinSession: jest.fn().mockResolvedValue({ prompt: jest.fn(), destroy }),
      promptPinyinBatch: jest.fn((_s: any, b: string[]) => Promise.resolve(b.map((t) => 'py-' + t))),
      _destroy: destroy
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

  it('resets state and destroys the session when the track changes', async () => {
    lyrics$.next(lines(10, 'a'));
    await flush();
    store.setActiveLine(0);
    await flush(); await flush();
    expect(read<Record<number, any>>(store.pinyinByIndex$)[0].status).toBe('done');

    lyrics$.next(lines(10, 'b'));
    await flush();
    expect(ai._destroy).toHaveBeenCalled();
    const map = read<Record<number, any>>(store.pinyinByIndex$);
    expect(map[0].status).toBe('pending'); // fresh seed for new track
    expect(map[0].text).toBe('b0汉');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx nx test web-lyrics-data-access`
Expected: FAIL — session not destroyed / state not reset on track change.

- [ ] **Step 3: Implement cleanup + active-line subscription**

In `reset()`, tear down the session and reset the focus:
```ts
private reset(): void {
  this.session?.destroy();
  this.session = null;
  this.draining = false;
  this.focus = 0;
  this.patchState({
    support: 'unknown',
    downloadState: 'idle',
    isChinese: false,
    pinyinByIndex: {},
    windowEnd: -1,
    visibleRange: null
  });
}
```
In the constructor, after `watchLyrics()`, add `this.watchActiveLine();`:
```ts
private watchActiveLine(): void {
  combineLatest([this.lyricsStore.isSynced$, this.lyricsStore.activeLine$]).subscribe(
    ([isSynced, activeLine]) => {
      if (isSynced && this.get().isChinese && this.get().enabled && activeLine >= 0) {
        this.setActiveLine(activeLine);
      }
    }
  );
}
```
Add the import: `import { combineLatest } from 'rxjs';`

- [ ] **Step 4: Run to verify pass**

Run: `npx nx test web-lyrics-data-access`
Expected: PASS (all PinyinStore describe blocks).

- [ ] **Step 5: Commit**

```bash
git add libs/web/lyrics/data-access
git commit -m "feat(lyrics): destroy session and reset PinyinStore on track change"
```

---

## Task 8: pinyin-toggle UI component

**Files:**
- Create: `libs/web/lyrics/ui/pinyin-toggle/src/lib/pinyin-toggle.component.ts|html|scss`
- Create: `libs/web/lyrics/ui/pinyin-toggle/src/lib/pinyin-toggle.module.ts`
- Create: `libs/web/lyrics/ui/pinyin-toggle/src/index.ts`
- Create: `libs/web/lyrics/ui/pinyin-toggle/project.json`, `jest.config.ts`, `tsconfig*.json`, `.eslintrc.json` (mirror `lyrics-toggle`)
- Test: `libs/web/lyrics/ui/pinyin-toggle/src/lib/pinyin-toggle.component.spec.ts`
- Modify: `tsconfig.base.json` (path mapping)

**Interfaces:**
- Consumes: `PinyinStore` (`enabled$`, `showToggle$`, `downloadState$`).
- Produces: `<as-pinyin-toggle>` rendering a button that calls `PinyinStore.setEnabled(!enabled)`.

- [ ] **Step 1: Generate the lib (mirror lyrics-toggle)**

Run:
```bash
npx nx g @nx/angular:library --name=pinyin-toggle --directory=libs/web/lyrics/ui/pinyin-toggle --importPath=@angular-spotify/web/lyrics/ui/pinyin-toggle --tags=type:ui,scope:web --unitTestRunner=jest --style=scss --no-interactive
```
Then delete the generated default component files if they differ from the names below.

- [ ] **Step 2: Write the failing test**

Create `pinyin-toggle.component.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { PinyinStore } from '@angular-spotify/web/lyrics/data-access';
import { PinyinToggleComponent } from './pinyin-toggle.component';
import { PinyinToggleModule } from './pinyin-toggle.module';

describe('PinyinToggleComponent', () => {
  let fixture: ComponentFixture<PinyinToggleComponent>;
  let component: PinyinToggleComponent;
  let store: { enabled$: BehaviorSubject<boolean>; showToggle$: BehaviorSubject<boolean>; downloadState$: BehaviorSubject<string>; setEnabled: jest.Mock };

  beforeEach(async () => {
    store = {
      enabled$: new BehaviorSubject(true),
      showToggle$: new BehaviorSubject(true),
      downloadState$: new BehaviorSubject('ready'),
      setEnabled: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [PinyinToggleModule],
      providers: [{ provide: PinyinStore, useValue: store }]
    }).compileComponents();
    fixture = TestBed.createComponent(PinyinToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('toggles enabled state via the store', () => {
    component.toggle();
    expect(store.setEnabled).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npx nx test web-lyrics-ui-pinyin-toggle`
Expected: FAIL — component not defined. (Confirm project name from the generated `project.json`.)

- [ ] **Step 4: Implement the component, template, module**

`pinyin-toggle.component.ts`:
```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PinyinStore } from '@angular-spotify/web/lyrics/data-access';

@Component({
  selector: 'as-pinyin-toggle',
  templateUrl: './pinyin-toggle.component.html',
  styleUrls: ['./pinyin-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PinyinToggleComponent {
  showToggle$ = this.pinyinStore.showToggle$;
  enabled$ = this.pinyinStore.enabled$;
  downloadState$ = this.pinyinStore.downloadState$;
  private enabled = true;

  constructor(private pinyinStore: PinyinStore) {
    this.enabled$.subscribe((v) => (this.enabled = v));
  }

  toggle(): void {
    this.pinyinStore.setEnabled(!this.enabled);
  }
}
```
`pinyin-toggle.component.html`:
```html
@if (showToggle$ | async) {
  <button
    nz-tooltip
    [nzTooltipTitle]="(downloadState$ | async) === 'downloading' ? 'Preparing pinyin…' : 'Show pinyin'"
    class="pinyin-toggle-btn"
    [class.active]="enabled$ | async"
    (click)="toggle()"
  >
    <span class="pinyin-toggle-label">拼</span>
  </button>
}
```
`pinyin-toggle.component.scss`:
```scss
.pinyin-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-subdued, #b3b3b3);
  &.active {
    color: var(--text-base, #fff);
  }
}
.pinyin-toggle-label {
  font-size: 16px;
  font-weight: 700;
}
```
`pinyin-toggle.module.ts`:
```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PinyinToggleComponent } from './pinyin-toggle.component';

@NgModule({
  imports: [CommonModule, NzToolTipModule],
  declarations: [PinyinToggleComponent],
  exports: [PinyinToggleComponent]
})
export class PinyinToggleModule {}
```
`src/index.ts`:
```ts
export * from './lib/pinyin-toggle.component';
export * from './lib/pinyin-toggle.module';
```

- [ ] **Step 5: Run to verify pass**

Run: `npx nx test web-lyrics-ui-pinyin-toggle`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add libs/web/lyrics/ui/pinyin-toggle tsconfig.base.json
git commit -m "feat(lyrics): add pinyin-toggle component"
```

---

## Task 9: Render pinyin above lines + viewport reporting in lyrics-view

**Files:**
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts|html|scss`
- Test: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts` (create)

**Interfaces:**
- Consumes: `@Input() pinyinByIndex: Record<number, PinyinLineState>`; `@Output() visibleRangeChange = EventEmitter<{ start: number; end: number }>`.
- Produces: pinyin `<span>` above each line whose entry `status === 'done'`; for unsynced lyrics, emits the visible index range from an IntersectionObserver.

- [ ] **Step 1: Write the failing test**

Create `lyrics-view.component.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LyricsViewComponent } from './lyrics-view.component';
import { LyricsViewModule } from './lyrics-view.module';

describe('LyricsViewComponent — pinyin', () => {
  let fixture: ComponentFixture<LyricsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LyricsViewModule] }).compileComponents();
    fixture = TestBed.createComponent(LyricsViewComponent);
  });

  it('renders pinyin above a line when its entry is done', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: 'nǐ hǎo', status: 'done' } };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.pinyin-line')?.textContent).toContain('nǐ hǎo');
  });

  it('does not render pinyin for pending or error entries', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: null, status: 'pending' } };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.pinyin-line')).toBeNull();
  });

  it('exposes a pinyinFor helper used by the template', () => {
    const c = fixture.componentInstance;
    c.pinyinByIndex = { 2: { text: '再见', pinyin: 'zài jiàn', status: 'done' } };
    expect(c.pinyinFor(2)).toBe('zài jiàn');
    expect(c.pinyinFor(0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: FAIL — `pinyinByIndex`/`pinyinFor` not defined.

- [ ] **Step 3: Implement component changes**

In `lyrics-view.component.ts`, add the import and members:
```ts
import { PinyinLineState } from '@angular-spotify/web/lyrics/data-access';

// add inputs/outputs:
@Input() pinyinByIndex: Record<number, PinyinLineState> = {};
@Output() visibleRangeChange = new EventEmitter<{ start: number; end: number }>();

pinyinFor(index: number): string | null {
  const entry = this.pinyinByIndex[index];
  return entry && entry.status === 'done' ? entry.pinyin : null;
}
```
(Keep the existing `EventEmitter`/`Output` imports; add `Output`/`EventEmitter` if not already imported — they are.)

In `lyrics-view.component.html`, render pinyin above the text:
```html
@for (line of lyrics; track line.text; let i = $index) {
  <p
    #lyricLine
    class="lyric-line"
    [class.active]="isSynced && i === activeLine"
    [class.past]="isSynced && activeLine >= 0 && i < activeLine"
    [class.synced]="isSynced"
    (click)="onLineClick(line)"
  >
    @if (pinyinFor(i)) {
      <span class="pinyin-line">{{ pinyinFor(i) }}</span>
    }
    <span class="hanzi-line">{{ line.text }}</span>
  </p>
}
```
In `lyrics-view.component.scss`, add:
```scss
.pinyin-line {
  display: block;
  font-size: 0.75em;
  color: var(--text-subdued, #b3b3b3);
  line-height: 1.2;
}
.hanzi-line {
  display: block;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: PASS.

- [ ] **Step 5: Add IntersectionObserver viewport reporting (unsynced)**

Append to `lyrics-view.component.ts` an observer that emits the visible index range when `!isSynced`. Implement `AfterViewInit`/`OnDestroy`:
```ts
import { AfterViewInit, OnDestroy } from '@angular/core';

// implements OnChanges, AfterViewInit, OnDestroy
private observer: IntersectionObserver | null = null;
private visible = new Set<number>();

ngAfterViewInit(): void {
  if (this.isSynced || typeof IntersectionObserver === 'undefined') {
    return;
  }
  this.observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const idx = Number((e.target as HTMLElement).dataset['index']);
      if (e.isIntersecting) {
        this.visible.add(idx);
      } else {
        this.visible.delete(idx);
      }
    }
    if (this.visible.size > 0) {
      const sorted = [...this.visible].sort((a, b) => a - b);
      this.visibleRangeChange.emit({ start: sorted[0], end: sorted[sorted.length - 1] });
    }
  });
  this.lyricLines.forEach((ref, i) => {
    (ref.nativeElement as HTMLElement).dataset['index'] = String(i);
    this.observer!.observe(ref.nativeElement);
  });
}

ngOnDestroy(): void {
  this.observer?.disconnect();
}
```
(This path is exercised manually; the unit tests above cover the rendering and helper. IntersectionObserver is `undefined` under the `node` jest env, so `ngAfterViewInit` is a no-op there — safe.)

- [ ] **Step 6: Run the view tests again**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: PASS (still green; observer code is inert under jsdom/node).

- [ ] **Step 7: Commit**

```bash
git add libs/web/lyrics/ui/lyrics-view
git commit -m "feat(lyrics): render pinyin above lines and report visible range"
```

---

## Task 10: Wire PinyinStore into the lyrics feature + manual verification

**Files:**
- Modify: `libs/web/lyrics/feature/src/lib/lyrics.component.ts`
- Modify: `libs/web/lyrics/feature/src/lib/lyrics.component.html`
- Modify: `libs/web/lyrics/feature/src/lib/lyrics.module.ts`

**Interfaces:**
- Consumes: `PinyinStore` (`pinyinByIndex$`), `LyricsViewComponent` inputs/outputs, `PinyinToggleComponent`.

- [ ] **Step 1: Expose pinyin state and wire callbacks in the feature component**

In `lyrics.component.ts`:
```ts
import { PinyinStore } from '@angular-spotify/web/lyrics/data-access';

// add to class:
pinyinByIndex$ = this.pinyinStore.pinyinByIndex$;

constructor(
  private lyricsStore: LyricsStore,
  private playerApi: PlayerApiService,
  private pinyinStore: PinyinStore
) {}

onVisibleRangeChange(range: { start: number; end: number }): void {
  this.pinyinStore.setVisibleRange(range);
}
```

- [ ] **Step 2: Bind in the feature template**

In `lyrics.component.html`, pass the new input/output to `<as-lyrics-view>`:
```html
<as-lyrics-view
  [lyrics]="lyrics$ | async"
  [activeLine]="(activeLine$ | async) ?? -1"
  [isSynced]="(isSynced$ | async) ?? false"
  [pinyinByIndex]="(pinyinByIndex$ | async) ?? {}"
  (seekTo)="onSeekTo($event)"
  (visibleRangeChange)="onVisibleRangeChange($event)"
></as-lyrics-view>
```
(Match the existing attribute style in the current template; only add the two new bindings if the others already exist.)

- [ ] **Step 3: Register the toggle module**

In `lyrics.module.ts`, add `PinyinToggleModule` to `imports` and place `<as-pinyin-toggle></as-pinyin-toggle>` near the existing lyrics controls in the relevant template (feature or now-playing-bar where `as-lyrics-toggle` already sits). Confirm where `as-lyrics-toggle` is used:
```bash
grep -rn "as-lyrics-toggle" libs/web
```
Add `<as-pinyin-toggle>` next to it and import `PinyinToggleModule` in that module.

- [ ] **Step 4: Build the web app**

Run: `npx nx build web --configuration=development`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Run the full affected test + lint suite**

Run:
```bash
npx nx run-many --target=test --projects=web-shared-data-access-built-in-ai,web-lyrics-data-access,web-lyrics-ui-pinyin-toggle,web-lyrics-ui-lyrics-view
npx nx run-many --target=lint --projects=web-shared-data-access-built-in-ai,web-lyrics-data-access,web-lyrics-ui-pinyin-toggle,web-lyrics-ui-lyrics-view
```
Expected: all PASS.

- [ ] **Step 6: Manual verification checklist (real Chrome with built-in AI)**

Serve the app (`npx nx serve web`) in a Chrome build with the built-in AI APIs enabled, then verify:
- [ ] Play a Mandopop track (e.g. 月亮代表我的心). Toggle appears; pinyin streams in above lines near the active line.
- [ ] First run shows "Preparing pinyin…" on the toggle tooltip during model download, then pinyin appears.
- [ ] As the song advances, lines ahead of the active line are translated before they become active.
- [ ] Toggling off hides pinyin instantly; toggling back on re-shows cached lines with no re-prompt.
- [ ] Play an English track: no toggle, lyrics behave as before.
- [ ] Open the same Mandopop track in Firefox/Safari: no toggle, lyrics behave as before (silent fallback).
- [ ] Switch tracks mid-translation: no console errors; new track seeds fresh.

- [ ] **Step 7: Commit**

```bash
git add libs/web/lyrics/feature libs/web/shell
git commit -m "feat(lyrics): wire PinyinStore and pinyin toggle into the lyrics view"
```

---

## Self-Review Notes

- **Spec coverage:** detection gating (T5), Han-line filtering (T5), playback-aware windowing + prefetch (T6), serial batched queue + index mapping + length-mismatch guard (T3/T6), in-memory cache (T6), track-change cancellation (T7), auto-on + toggle (T8), silent/subtle fallback (T2/T8), unsynced viewport path (T9), reusable BuiltInAiService (T1–T3), tests at every layer. All spec sections map to a task.
- **Tunables** are centralized in `pinyin.models.ts` and consumed by name.
- **Type consistency:** `PinyinLineState`/`PinyinState` defined once in T4 and reused verbatim in T5–T9; `PinyinSession`/`AiAvailability` defined in T1 and reused in T3/T6.
- **Out of scope (deferred):** IndexedDB persistence, PiP/overlay pinyin, Translator path, automated live-model test.
