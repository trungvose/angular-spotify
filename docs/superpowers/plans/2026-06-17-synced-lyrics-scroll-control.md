# Synced Lyrics "Take Control" Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user scroll synced lyrics freely while playing — suspend the auto-scroll-back, show a floating Sync pill, and resume auto-scroll only when Sync is clicked or the track changes.

**Architecture:** All changes are local to the shared `LyricsViewComponent`. A component-local `userControlling` flag gates the existing `scrollToActiveLine()` call. A `scroll` listener on the `.lyrics-container` element sets the flag, using an `isProgrammaticScroll` guard (with a settle timer) to ignore the scroll events that `scrollIntoView` itself emits. New track input resets the flag. A floating Sync button clears the flag and re-scrolls.

**Tech Stack:** Angular (OnPush change detection), TypeScript, Jest + jest-preset-angular, Nx, Tailwind/SCSS.

## Global Constraints

- Node `v18` (`.nvmrc`); tests run via `nx test web-lyrics-ui-lyrics-view`.
- Component uses `ChangeDetectionStrategy.OnPush` — any state change read by the template from a non-Angular callback must call `ChangeDetectorRef.markForCheck()`.
- Only these files may change: `lyrics-view.component.ts`, `lyrics-view.component.html`, `lyrics-view.component.scss`, and the new `lyrics-view.component.spec.ts`. Do NOT touch the store, feature component, overlay, PiP, or the public `@Input`/`@Output` API.
- Theming tokens: `rgb(var(--text-baseline))`, `rgb(var(--background-baseline))` (already used in the component's SCSS).
- Timing constants (declare at top of component file):
  - `PROGRAMMATIC_SCROLL_FALLBACK_MS = 500`
  - `PROGRAMMATIC_SCROLL_SETTLE_MS = 150`

---

### Task 1: Gate auto-scroll behind a `userControlling` flag + add `onSync()`

**Files:**
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts`
- Test: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts` (create)

**Interfaces:**
- Consumes: nothing new.
- Produces: public field `userControlling: boolean` (default `false`); public method `onSync(): void`. `ngOnChanges` skips `scrollToActiveLine()` while `userControlling` is `true`.

- [ ] **Step 1: Write the failing test**

Create `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts`:

```ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { LyricLine } from '@angular-spotify/web/lyrics/data-access';
import { LyricsViewComponent } from './lyrics-view.component';

describe('LyricsViewComponent', () => {
  let component: LyricsViewComponent;
  let fixture: ComponentFixture<LyricsViewComponent>;

  const LYRICS: LyricLine[] = [
    { text: 'line 0', time: 0 },
    { text: 'line 1', time: 1000 },
    { text: 'line 2', time: 2000 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LyricsViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LyricsViewComponent);
    component = fixture.componentInstance;
    // jsdom has no scrollIntoView implementation
    Element.prototype.scrollIntoView = jest.fn();
  });

  const renderSynced = () => {
    component.lyrics = LYRICS;
    component.isSynced = true;
    fixture.detectChanges();
  };

  const changeActiveLine = (value: number) => {
    const prev = component.activeLine;
    component.activeLine = value;
    component.ngOnChanges({
      activeLine: new SimpleChange(prev, value, false)
    });
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('auto-scrolls to the active line when not controlling', fakeAsync(() => {
    renderSynced();
    (Element.prototype.scrollIntoView as jest.Mock).mockClear();

    changeActiveLine(1);
    tick();

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  }));

  it('does NOT auto-scroll while the user is controlling', fakeAsync(() => {
    renderSynced();
    component.userControlling = true;
    (Element.prototype.scrollIntoView as jest.Mock).mockClear();

    changeActiveLine(1);
    tick();

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  }));

  it('onSync() clears control and scrolls back to the active line', fakeAsync(() => {
    renderSynced();
    component.userControlling = true;
    component.activeLine = 2;
    (Element.prototype.scrollIntoView as jest.Mock).mockClear();

    component.onSync();
    tick();

    expect(component.userControlling).toBe(false);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  }));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: FAIL — `onSync` is not a function / `userControlling` undefined, and the "does NOT auto-scroll" test fails because the gate doesn't exist yet.

- [ ] **Step 3: Implement the minimal code**

In `lyrics-view.component.ts`, add the field, the gate in `ngOnChanges`, and `onSync()`:

```ts
export class LyricsViewComponent implements OnChanges {
  @Input() lyrics: LyricLine[] | null = null;
  @Input() activeLine = -1;
  @Input() isSynced = false;
  @Output() seekTo = new EventEmitter<number>();
  @ViewChildren('lyricLine') lyricLines!: QueryList<ElementRef>;

  userControlling = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['activeLine'] &&
      this.isSynced &&
      this.activeLine >= 0 &&
      !this.userControlling
    ) {
      this.scrollToActiveLine();
    }
  }

  onLineClick(line: LyricLine): void {
    if (this.isSynced && line.time !== null) {
      this.seekTo.emit(line.time);
    }
  }

  onSync(): void {
    this.userControlling = false;
    this.scrollToActiveLine();
  }

  private scrollToActiveLine(): void {
    // Defer scroll to after Angular has updated the DOM
    setTimeout(() => {
      const lineElements = this.lyricLines?.toArray();
      if (!lineElements || !lineElements[this.activeLine]) {
        return;
      }
      lineElements[this.activeLine].nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts \
        libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts
git commit -m "feat(lyrics): gate synced auto-scroll behind userControlling flag"
```

---

### Task 2: Reset control state when the track changes

**Files:**
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts`
- Test: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts`

**Interfaces:**
- Consumes: `userControlling` from Task 1.
- Produces: `ngOnChanges` resets `userControlling = false` when the `lyrics` input changes after first bind.

- [ ] **Step 1: Write the failing test**

Add inside the existing `describe`:

```ts
  it('resets control when a new lyrics array is bound (track change)', () => {
    component.lyrics = LYRICS;
    component.isSynced = true;
    component.userControlling = true;

    const next: LyricLine[] = [{ text: 'new song', time: 0 }];
    component.lyrics = next;
    component.ngOnChanges({
      lyrics: new SimpleChange(LYRICS, next, false)
    });

    expect(component.userControlling).toBe(false);
  });

  it('does NOT reset control on the first lyrics bind', () => {
    component.userControlling = true;

    component.lyrics = LYRICS;
    component.ngOnChanges({
      lyrics: new SimpleChange(undefined, LYRICS, true)
    });

    expect(component.userControlling).toBe(true);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: FAIL — `resets control when a new lyrics array is bound` expects `false` but gets `true`.

- [ ] **Step 3: Implement the minimal code**

In `lyrics-view.component.ts`, add the reset block at the top of `ngOnChanges` (before the `activeLine` block, so a same-cycle `activeLine` change re-scrolls the new track):

```ts
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lyrics'] && !changes['lyrics'].firstChange) {
      this.userControlling = false;
    }

    if (
      changes['activeLine'] &&
      this.isSynced &&
      this.activeLine >= 0 &&
      !this.userControlling
    ) {
      this.scrollToActiveLine();
    }
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts \
        libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts
git commit -m "feat(lyrics): resume auto-scroll when the track changes"
```

---

### Task 3: Detect user scroll vs. programmatic scroll

**Files:**
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts`
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.html`
- Test: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts`

**Interfaces:**
- Consumes: `userControlling`, `scrollToActiveLine()` from Task 1.
- Produces: a `scroll` listener on the `.lyrics-container` element (template ref `#lyricsContainer`) that sets `userControlling = true` on a genuine user scroll; a `private isProgrammaticScroll` guard set around `scrollIntoView`. New constants `PROGRAMMATIC_SCROLL_FALLBACK_MS`, `PROGRAMMATIC_SCROLL_SETTLE_MS`.

- [ ] **Step 1: Add the template ref so the `@ViewChild` can resolve**

In `lyrics-view.component.html`, add `#lyricsContainer` to the outer container:

```html
<div class="lyrics-container" #lyricsContainer>
  @if (lyrics && lyrics.length > 0) {
    <div class="lyrics-scroll">
      @for (line of lyrics; track line.text; let i = $index) {
        <p
          #lyricLine
          class="lyric-line"
          [class.active]="isSynced && i === activeLine"
          [class.past]="isSynced && activeLine >= 0 && i < activeLine"
          [class.synced]="isSynced"
          (click)="onLineClick(line)"
        >
          {{ line.text }}
        </p>
      }
    </div>
  } @else {
    <div class="no-lyrics">
      <p>No lyrics available for this track.</p>
    </div>
  }
</div>
```

- [ ] **Step 2: Write the failing tests**

Add inside the existing `describe`:

```ts
  const fireScroll = () => {
    component.lyricsContainer.nativeElement.dispatchEvent(new Event('scroll'));
  };

  it('marks the user as controlling on a genuine scroll', () => {
    renderSynced();
    expect(component.userControlling).toBe(false);

    fireScroll();

    expect(component.userControlling).toBe(true);
  });

  it('ignores scroll events emitted by programmatic scrolling', fakeAsync(() => {
    renderSynced();
    component.activeLine = 1;

    // Begin a programmatic scroll; its scroll events must not flip the flag.
    component.onSync();
    tick(); // runs the deferred scrollToActiveLine -> sets the guard
    fireScroll();

    expect(component.userControlling).toBe(false);
    tick(600); // let the settle/fallback timer clear the guard
  }));

  it('clears the programmatic guard after the fallback timeout', fakeAsync(() => {
    renderSynced();
    component.onSync();
    tick(); // guard set
    tick(600); // past PROGRAMMATIC_SCROLL_FALLBACK_MS

    fireScroll();

    expect(component.userControlling).toBe(true);
  }));
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: FAIL — `component.lyricsContainer` is undefined (no `@ViewChild`), and scroll events do nothing.

- [ ] **Step 4: Implement the minimal code**

Update `lyrics-view.component.ts`. Add imports and constants at the top:

```ts
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { LyricLine } from '@angular-spotify/web/lyrics/data-access';

const PROGRAMMATIC_SCROLL_FALLBACK_MS = 500;
const PROGRAMMATIC_SCROLL_SETTLE_MS = 150;
```

Update the class declaration, add the `@ViewChild`, fields, constructor, lifecycle hooks, scroll handler, and wrap the programmatic scroll:

```ts
export class LyricsViewComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() lyrics: LyricLine[] | null = null;
  @Input() activeLine = -1;
  @Input() isSynced = false;
  @Output() seekTo = new EventEmitter<number>();
  @ViewChildren('lyricLine') lyricLines!: QueryList<ElementRef>;
  @ViewChild('lyricsContainer') lyricsContainer!: ElementRef<HTMLElement>;

  userControlling = false;

  private isProgrammaticScroll = false;
  private programmaticScrollTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollHandler?: () => void;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lyrics'] && !changes['lyrics'].firstChange) {
      this.userControlling = false;
    }

    if (
      changes['activeLine'] &&
      this.isSynced &&
      this.activeLine >= 0 &&
      !this.userControlling
    ) {
      this.scrollToActiveLine();
    }
  }

  ngAfterViewInit(): void {
    const el = this.lyricsContainer?.nativeElement;
    if (!el) {
      return;
    }
    this.scrollHandler = () => this.onContainerScroll();
    this.ngZone.runOutsideAngular(() => {
      el.addEventListener('scroll', this.scrollHandler!, { passive: true });
    });
  }

  ngOnDestroy(): void {
    const el = this.lyricsContainer?.nativeElement;
    if (el && this.scrollHandler) {
      el.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.programmaticScrollTimer) {
      clearTimeout(this.programmaticScrollTimer);
    }
  }

  onLineClick(line: LyricLine): void {
    if (this.isSynced && line.time !== null) {
      this.seekTo.emit(line.time);
    }
  }

  onSync(): void {
    this.userControlling = false;
    this.scrollToActiveLine();
  }

  private onContainerScroll(): void {
    if (this.isProgrammaticScroll) {
      // Smooth-scroll burst — let it settle, then re-enable detection.
      this.armProgrammaticScrollSettle(PROGRAMMATIC_SCROLL_SETTLE_MS);
      return;
    }
    if (!this.isSynced || this.userControlling) {
      return;
    }
    this.ngZone.run(() => {
      this.userControlling = true;
      this.cdr.markForCheck();
    });
  }

  private scrollToActiveLine(): void {
    // Defer scroll to after Angular has updated the DOM
    setTimeout(() => {
      const lineElements = this.lyricLines?.toArray();
      if (!lineElements || !lineElements[this.activeLine]) {
        return;
      }
      this.beginProgrammaticScroll();
      lineElements[this.activeLine].nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }

  private beginProgrammaticScroll(): void {
    this.isProgrammaticScroll = true;
    this.armProgrammaticScrollSettle(PROGRAMMATIC_SCROLL_FALLBACK_MS);
  }

  private armProgrammaticScrollSettle(delay: number): void {
    if (this.programmaticScrollTimer) {
      clearTimeout(this.programmaticScrollTimer);
    }
    this.programmaticScrollTimer = setTimeout(() => {
      this.isProgrammaticScroll = false;
      this.programmaticScrollTimer = null;
    }, delay);
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: PASS (9 tests). If the `does NOT auto-scroll` test from Task 1 now warns about an unsettled timer, the `tick(600)` calls added here cover it.

- [ ] **Step 6: Commit**

```bash
git add libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.ts \
        libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.html \
        libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts
git commit -m "feat(lyrics): detect user scroll and suspend auto-scroll"
```

---

### Task 4: Floating Sync pill UI

**Files:**
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.html`
- Modify: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.scss`
- Test: `libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts`

**Interfaces:**
- Consumes: `userControlling`, `isSynced`, `onSync()`.
- Produces: a `<button class="sync-pill">` rendered only when `isSynced && userControlling`, wired to `onSync()`.

- [ ] **Step 1: Write the failing test**

Add inside the existing `describe`:

```ts
  const querySyncPill = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('.sync-pill');

  it('shows the Sync pill only while controlling', () => {
    renderSynced();
    expect(querySyncPill()).toBeNull();

    component.userControlling = true;
    fixture.detectChanges();
    expect(querySyncPill()).not.toBeNull();
  });

  it('clicking the Sync pill calls onSync()', () => {
    renderSynced();
    component.userControlling = true;
    fixture.detectChanges();
    const spy = jest.spyOn(component, 'onSync');

    querySyncPill()!.click();

    expect(spy).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: FAIL — `.sync-pill` element not found.

- [ ] **Step 3: Implement the markup**

In `lyrics-view.component.html`, add the button inside `.lyrics-container`, after the `@if/@else` block (still inside the container so it floats over the lyrics):

```html
<div class="lyrics-container" #lyricsContainer>
  @if (lyrics && lyrics.length > 0) {
    <div class="lyrics-scroll">
      @for (line of lyrics; track line.text; let i = $index) {
        <p
          #lyricLine
          class="lyric-line"
          [class.active]="isSynced && i === activeLine"
          [class.past]="isSynced && activeLine >= 0 && i < activeLine"
          [class.synced]="isSynced"
          (click)="onLineClick(line)"
        >
          {{ line.text }}
        </p>
      }
    </div>
  } @else {
    <div class="no-lyrics">
      <p>No lyrics available for this track.</p>
    </div>
  }

  @if (isSynced && userControlling) {
    <button
      type="button"
      class="sync-pill"
      aria-label="Sync lyrics to current line"
      (click)="onSync()"
    >
      <svg
        class="sync-pill__icon"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14" />
        <path d="m6 13 6 6 6-6" />
      </svg>
      Sync
    </button>
  }
</div>
```

- [ ] **Step 4: Implement the styles**

In `lyrics-view.component.scss`, ensure the container is a positioning context and add the pill styles. Update `.lyrics-container` and append the `.sync-pill` block:

```scss
.lyrics-container {
  @apply w-full h-full overflow-y-auto px-8 py-12 relative;
  background: rgb(var(--background-baseline));
}
```

```scss
.sync-pill {
  @apply sticky flex items-center gap-2 px-4 py-2 mx-auto rounded-full text-sm font-semibold;
  bottom: 1.5rem;
  width: fit-content;
  color: rgb(var(--background-baseline));
  background: rgb(var(--text-baseline));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: opacity 0.3s ease, transform 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &__icon {
    display: block;
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx nx test web-lyrics-ui-lyrics-view`
Expected: PASS (11 tests).

- [ ] **Step 6: Lint the touched files**

Run: `npx nx lint web-lyrics-ui-lyrics-view`
Expected: PASS, no new lint errors.

- [ ] **Step 7: Commit**

```bash
git add libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.html \
        libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.scss \
        libs/web/lyrics/ui/lyrics-view/src/lib/lyrics-view.component.spec.ts
git commit -m "feat(lyrics): add floating Sync pill to re-engage auto-scroll"
```

---

## Manual verification (after all tasks)

1. Play a track with synced lyrics; confirm the active line auto-scrolls/centers as before.
2. While playing, scroll up or down — the view stays put (no snap-back) and the Sync pill fades in at bottom-center.
3. Keep scrolling freely; it never yanks back.
4. Click Sync — the view smooth-scrolls back to the current line and the pill disappears; auto-scroll resumes.
5. Let the track change while scrolled away — auto-scroll resumes for the new song and the pill is gone.
6. Click a lyric line to seek — playback jumps but control state is unchanged.

---

## Self-Review

- **Spec coverage:** suppress-on-user-scroll (Task 1 + 3), Sync pill + click-to-resume (Task 4 + `onSync`), auto re-sync on track change (Task 2), programmatic-vs-user scroll guard with settle + fallback (Task 3), click-to-seek unaffected (unchanged `onLineClick`, verified in manual step 6), scope limited to `lyrics-view` files (constraints). All covered.
- **Placeholder scan:** none — every code/test step has concrete content.
- **Type consistency:** `userControlling`, `onSync()`, `scrollToActiveLine()`, `beginProgrammaticScroll()`, `armProgrammaticScrollSettle()`, `onContainerScroll()`, `isProgrammaticScroll`, `programmaticScrollTimer`, `scrollHandler`, `lyricsContainer` are named identically across tasks. Constants match the Global Constraints values.
