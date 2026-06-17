import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef, SimpleChange } from '@angular/core';
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

  const fireScroll = () => {
    component.lyricsContainer.nativeElement.dispatchEvent(new Event('scroll'));
  };

  const querySyncPill = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('.sync-pill');

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('auto-scrolls to the active line when not controlling', fakeAsync(() => {
    renderSynced();
    (Element.prototype.scrollIntoView as jest.Mock).mockClear();

    changeActiveLine(1);
    tick();

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    tick(600); // drain the programmatic scroll fallback timer
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
    tick(600); // drain the programmatic scroll fallback timer
  }));

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

  it('stops reacting to scroll after destroy', () => {
    renderSynced();
    const el = component.lyricsContainer.nativeElement;
    fixture.destroy();
    el.dispatchEvent(new Event('scroll'));
    expect(component.userControlling).toBe(false);
  });

  it('hides the Sync pill when isSynced is false even if userControlling is true', () => {
    component.lyrics = LYRICS;
    component.isSynced = false;
    component.userControlling = true;
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    expect(querySyncPill()).toBeNull();
  });

  it('shows the Sync pill only while controlling', () => {
    renderSynced();
    expect(querySyncPill()).toBeNull();

    component.userControlling = true;
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    expect(querySyncPill()).not.toBeNull();
  });

  it('clicking the Sync pill calls onSync()', () => {
    renderSynced();
    component.userControlling = true;
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    const spy = jest.spyOn(component, 'onSync');

    const pill = querySyncPill();
    expect(pill).not.toBeNull();
    pill?.click();

    expect(spy).toHaveBeenCalled();
  });
});
