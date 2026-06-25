# Pinyin Lyrics via Chrome Built-in AI — Design

**Date:** 2026-06-21
**Status:** Approved (design); pending implementation plan
**Related:** STACK 2026 lightning-talk CFP — `/Users/trung.vo/Source/trungvose/talks/2026-06-27-web/chrome-builtin-ai-cfp.md`
**POC:** `/Users/trung.vo/Source/trungvose/talks/2026-11-04-pinyin-poc/index.html`

## Problem

Angular Spotify shows synced lyrics from LRCLIB. When a Mandopop song plays, a
listener who can hear the melody but not read Chinese characters fast enough
cannot sing along. We want tone-marked Hanyu Pinyin rendered above each Chinese
lyric line, generated **on-device** via Chrome's built-in AI (Gemini Nano) — no
network round-trip, no listening data leaving the browser, works offline.

The model is slow, so we translate progressively: the lines the listener is
about to need first, more as the song advances.

## Goals / Non-goals

**Goals**
- Detect Chinese lyrics and render tone-marked pinyin above each Han-containing line.
- Run fully on-device through the built-in Prompt API + Language Detector API.
- Progressive, playback-aware generation so the active region is ready first.
- Production bar: feature detection, graceful fallback on unsupported browsers,
  first-run model-download UX, tests.

**Non-goals (this iteration)**
- Persisting pinyin across sessions (cache is in-memory for the session only).
- English translation of lyrics (the Translator API is out of scope; noted as a
  talk aside only).
- Pinyin in the PiP / overlay lyrics surfaces (main lyrics view first; future work).
- A live-model integration test (env-dependent, ~2GB download).

## Key decisions

| Decision | Choice |
|---|---|
| Quality bar | Production feature (detection, fallback, download UX, tests) |
| Window trigger | Playback-aware for synced; IntersectionObserver/viewport for plain |
| Batching | Window of N lines per prompt, structured JSON back, mapped by index |
| Caching | In-memory for the session (re-runs on a fresh page load) |
| Activation | Auto-on when Chinese detected, with a toggle to hide |
| Fallback UX | Silent when unsupported; subtle inline "Preparing pinyin…" on download |
| Architecture | Reusable built-in-AI service + dedicated `PinyinStore` + view rendering |

## Architecture

```
libs/web/shared/data-access/built-in-ai   (NEW, reusable)
  BuiltInAiService
    • isPromptApiAvailable() / isDetectorAvailable()   (typeof globalThis[name])
    • detectLanguage(text) → { lang, confidence }
    • createPinyinSession({ onDownloadProgress }) → session   (system prompt baked in)
    • promptPinyinBatch(session, lines[], signal) → string[]   (responseConstraint JSON)
        ▲ only place that touches window.LanguageModel / LanguageDetector

libs/web/lyrics/data-access
  PinyinStore (ComponentStore, NEW)
    • subscribes to LyricsStore: lyrics$, isSynced$, activeLine$
    • state: enabled, support, downloadState, pinyinByIndex
    • windowing + serial batch queue + in-memory cache
  LyricsStore (unchanged)

libs/web/lyrics/ui
  lyrics-view.component  → renders pinyin above each line
  pinyin-toggle (NEW, mirrors lyrics-toggle) → show/hide
```

### Data model

`LyricLine` stays pure (`{ time, text }`). Pinyin lives in a parallel structure
in `PinyinStore`, keyed by line index:

```ts
interface PinyinLineState {
  text: string;                                   // source hanzi line
  pinyin: string | null;
  status: 'pending' | 'loading' | 'done' | 'error';
}
// state.pinyinByIndex: Record<number, PinyinLineState>
```

Only lines containing Han characters get an entry; pure-English/instrumental
lines are skipped.

## Data flow

**On track load (lyrics arrive in `LyricsStore`):**
1. Feature-detect. Prompt API undefined or `availability() === 'unavailable'` →
   stay silent; lyrics behave exactly as today.
2. Sample lines → `detectLanguage`. Not Chinese / low confidence → idle, no toggle.
3. Chinese detected → toggle appears, `enabled` defaults **on**. Build
   `pinyinByIndex` with each Han-containing line `pending`.
4. Create one session (download monitor → `downloadState`), reused for the track.

**Windowing (what to translate next):**
- **Synced lyrics:** window = `[activeLine, activeLine + LOOKAHEAD]`. First batch
  also covers line 0 so it is ready before playback. As `activeLine$` advances and
  the unresolved frontier comes within `PREFETCH_MARGIN` of the window edge,
  extend the window forward.
- **Unsynced/plain lyrics:** an `IntersectionObserver` in the view reports the
  visible line range to the store; the window tracks the viewport.

**Serial batch queue:**
- One serial queue drains `BATCH_SIZE` `pending` lines nearest the current focus
  first. Serial because Gemini Nano is a single slow session — parallel prompts
  thrash.
- Per batch: mark lines `loading` → `promptPinyinBatch` → map results back **by
  index** → mark `done`. The system prompt is the POC's validated one:
  *"precise Chinese-to-Hanyu-Pinyin transliterator, tone marks (ā á ǎ à), do not
  translate meaning."* Batching by full line gives the model line context to
  disambiguate 多音字 (e.g. 行 háng/xíng).
- Parse via the Prompt API's `responseConstraint` (JSON-schema structured output)
  when available; fall back to regex array extraction (POC approach) otherwise.

**Cancellation:** on track change, an `AbortController` cancels the in-flight
batch, the session is destroyed, and state is cleared.

## Error handling & fallback

| Situation | Behavior |
|---|---|
| Prompt API undefined (Safari/Firefox) | Silent. No toggle, lyrics unchanged. |
| `availability() === 'unavailable'` | Silent. |
| `downloadable` / `downloading` | Subtle inline "Preparing pinyin…" near toggle; pinyin streams in when ready. |
| Not Chinese / low confidence | Idle, no toggle. |
| Batch throws or returns malformed / length-mismatched JSON | Mark those lines `error`; render hanzi only; retry on next windowing pass. Never misalign pinyin to the wrong hanzi. |
| Track changes mid-flight | AbortController cancels; session destroyed; state cleared. |
| User toggles off | Stop draining queue, hide pinyin; keep cached `done` results for instant re-show. |

Guiding rule: **pinyin is purely additive** — any failure degrades to today's
plain lyrics and never blocks them.

## Testing

All browser-AI access funnels through `BuiltInAiService`, so everything else is
tested by mocking that one service.

- **`BuiltInAiService` (unit):** mock `globalThis.LanguageModel` /
  `LanguageDetector`. Cover feature-detect true/false, availability states,
  `detectLanguage` parsing, `promptPinyinBatch` happy path, malformed JSON
  handling, abort propagation.
- **`PinyinStore` (unit — core logic):** fake `BuiltInAiService` + stubbed
  `LyricsStore`. Cover: detection gating; Han-line filtering; synced windowing +
  prefetch margin; serial queue nearest-first with no overlap; index mapping incl.
  length-mismatch guard; cache hit (no re-prompt for `done`); track-change
  cancellation clears state; toggle off stops queue but keeps cache.
- **`LyricsViewComponent` (unit):** renders pinyin above hanzi when present;
  hanzi-only for `pending`/`error`; toggle shows/hides; unsynced path feeds the
  IntersectionObserver range to the store (observer mocked).
- **Tunables** (`LOOKAHEAD`, `PREFETCH_MARGIN`, `BATCH_SIZE`) exported as constants
  so tests pin behavior.
- **Manual verification** in real Chrome with built-in AI is a checklist item
  (no automated live-model test).

## Open questions / future work

- Persisting pinyin (IndexedDB) across sessions if re-generation cost proves
  annoying in practice.
- Extending pinyin to the PiP / overlay surfaces.
- Tuning `LOOKAHEAD` / `BATCH_SIZE` against real device latency.
