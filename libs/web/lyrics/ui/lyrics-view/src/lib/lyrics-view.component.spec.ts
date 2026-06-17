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
});
