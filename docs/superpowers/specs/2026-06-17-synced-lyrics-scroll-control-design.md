# Synced Lyrics — "Take Control" Scroll Behavior

**Date:** 2026-06-17
**Status:** Approved (design)

## Problem

When synced lyrics are playing, the view auto-scrolls so the active line stays
centered. If the user scrolls up or down to read other parts of the lyrics, the
next active-line change yanks the view back to the active line. This makes it
impossible to read ahead or look back while the song plays.

Spotify solves this: scrolling while playing surfaces a **Sync** button and lets
you scroll freely with no snap-back. Auto-scroll only resumes when you click
Sync (or the song changes).

## Goal

Mirror the Spotify behavior in the synced lyrics view:

1. While synced lyrics play, a user scroll (up or down) suspends auto-scroll-back.
2. A floating **Sync** pill fades in once the user has taken control.
3. Clicking the Sync pill re-engages auto-scroll and smooth-scrolls back to the
   current active line; the pill fades out.
4. Changing the track auto-resumes auto-scroll for the new song.
5. No auto re-sync on idle — manual until Sync is clicked or the song changes.

## Scope

All changes are local to the shared synced-lyrics view:

- `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts`
- `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.html`
- `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.scss`

`as-lyrics-view` is only consumed by `libs/web/lyrics/feature` (the main lyrics
page). The lyrics store, parent feature component, overlay, and PiP components
are **not** touched. No new inputs/outputs are required on the component's public
API.

## Current behavior (baseline)

`lyrics-view.component.ts`:

- `ngOnChanges` calls `scrollToActiveLine()` whenever `activeLine` changes and
  `isSynced && activeLine >= 0`.
- `scrollToActiveLine()` defers via `setTimeout`, then calls
  `scrollIntoView({ behavior: 'smooth', block: 'center' })` on the active line
  element. This scrolls the nearest scrollable ancestor, which is
  `.lyrics-container` (`overflow-y-auto`) inside this component.

There is currently no listening for user scroll and no awareness of user intent.

## Design

### Component-local state

- `userControlling = false` — `true` once the user scrolls away while playing.
  While `true`, `scrollToActiveLine()` is skipped.
- `private isProgrammaticScroll = false` — guard flag set immediately before a
  programmatic scroll and cleared once the scroll settles. Used to tell
  programmatic scroll events apart from user scroll events.
- `@ViewChild('lyricsContainer') lyricsContainer!: ElementRef<HTMLElement>` —
  reference to the `.lyrics-container` scrolling element so we can bind its
  `scroll` event.

### Distinguishing user scroll from programmatic scroll

This is the crux of the feature. `scrollIntoView({ behavior: 'smooth' })` emits
`scroll` events that are indistinguishable from user-initiated scrolls.

Approach — a guard flag with a settle timeout:

1. Before each programmatic scroll, set `isProgrammaticScroll = true`.
2. The smooth scroll fires a burst of `scroll` events; while
   `isProgrammaticScroll` is `true`, these are ignored.
3. Clear `isProgrammaticScroll` once the scroll settles. Settle is detected by a
   short debounce timer (e.g. ~150ms after the last programmatic `scroll`
   event), with a hard fallback timeout so the flag can never get stuck.
4. Any `scroll` event observed while `isProgrammaticScroll` is `false` is treated
   as a user scroll → set `userControlling = true`.

The exact timing constants are an implementation detail to be tuned and covered
by tests; the contract is: a real user scroll always flips `userControlling`,
and a programmatic scroll never does.

The `scroll` listener should be attached so it does not flood change detection
(e.g. outside Angular / `{ passive: true }`), updating `userControlling` and
re-entering change detection only on transition.

### Behavior matrix

| State | `activeLine` changes | Sync pill |
| --- | --- | --- |
| Synced, playing, not controlling | `scrollToActiveLine()` runs (programmatic) | hidden |
| User scrolls away | auto-scroll-back suppressed | **fades in** |
| Click Sync pill | `userControlling = false`, scroll back to active line | fades out |
| Track changes (new lyrics) | `userControlling` reset to `false`, auto-scroll resumes | hidden |
| Click a lyric line (seek) | unchanged — does **not** set `userControlling` | unchanged |

### Track change detection

In `ngOnChanges`, when `changes['lyrics']` indicates a new lyrics array (new song
loaded), reset `userControlling = false`. This makes auto-scroll resume for the
new track per the approved "auto re-sync on new song" choice. Guard against the
initial binding so the reset is harmless on first load.

### Sync action

`onSync()`:

1. Set `userControlling = false`.
2. Call `scrollToActiveLine()` to smooth-scroll back to the current active line.

`onLineClick()` is unchanged — seeking by clicking a line keeps current control
state (it does not toggle `userControlling`).

### UI

A `<button class="sync-pill">` rendered inside `.lyrics-container`:

- Shown only when `isSynced && userControlling` (via `@if`).
- Positioned floating near the bottom, horizontally centered
  (`position: sticky`/`absolute` with `bottom` offset and centered transform).
- Opacity/transform transition for fade in/out, consistent with the existing
  `transition` styling in the component.
- Contains an icon + "Sync" label, themed with the existing
  `var(--text-baseline)` / `var(--background-baseline)` tokens used elsewhere in
  the component.
- Accessible: real `<button>`, `aria-label`, keyboard focusable.

## Error handling / edge cases

- Lyrics container ref not yet available → scroll/listener setup guards with
  null checks (matches existing defensive style in `scrollToActiveLine`).
- Settle timer must always clear `isProgrammaticScroll` via a fallback timeout so
  the guard can never get permanently stuck and silently kill auto-scroll.
- Non-synced lyrics: feature is inert (`isSynced` false → no listener effect, no
  pill).
- Empty/no lyrics: existing no-lyrics branch is unchanged.

## Testing

Jest specs in the existing `lyrics-view` test setup:

1. Auto-scroll fires (`scrollIntoView` called) when synced, playing, and not
   controlling.
2. A simulated user `scroll` event sets `userControlling = true` and suppresses
   the next auto-scroll-back.
3. A programmatic scroll (guard flag set) does **not** set `userControlling`.
4. `onSync()` resets `userControlling` to `false` and triggers a scroll back to
   the active line.
5. A new `lyrics` input array resets `userControlling` to `false`.
6. Sync pill visibility binding reflects `isSynced && userControlling`.

## Out of scope

- Lyrics overlay and PiP components (they do not use `as-lyrics-view`).
- Any change to the lyrics store, fetching, or sync timing logic.
- Auto re-sync after a period of scroll inactivity.
