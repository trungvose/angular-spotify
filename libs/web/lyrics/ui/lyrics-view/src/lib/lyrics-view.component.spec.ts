import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { LyricLine } from '@angular-spotify/web/lyrics/data-access';
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
    c.annotationByIndex = { 0: { text: '你好', annotation: 'nǐ hǎo', status: 'done' } };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.annotation-line')?.textContent).toContain('nǐ hǎo');
  });

  it('does not render pinyin for pending or error entries', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.annotationByIndex = { 0: { text: '你好', annotation: null, status: 'pending' } };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.annotation-line')).toBeNull();
  });

  it('exposes an annotationFor helper used by the template', () => {
    const c = fixture.componentInstance;
    c.annotationByIndex = { 2: { text: '再见', annotation: 'zài jiàn', status: 'done' } };
    expect(c.annotationFor(2)).toBe('zài jiàn');
    expect(c.annotationFor(0)).toBeNull();
  });

  it('collapses pinyin lines when annotationEnabled is false (kept mounted to animate out)', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.annotationByIndex = { 0: { text: '你好', annotation: 'nǐ hǎo', status: 'done' } };
    c.annotationEnabled = false;
    fixture.detectChanges();
    const line = (fixture.nativeElement as HTMLElement).querySelector('.annotation-line');
    expect(line).not.toBeNull();
    expect(line?.classList).toContain('annotation-line--hidden');
    expect(line?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows pinyin lines when annotationEnabled is true with a done entry', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.annotationByIndex = { 0: { text: '你好', annotation: 'nǐ hǎo', status: 'done' } };
    c.annotationEnabled = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.annotation-line')?.textContent).toContain('nǐ hǎo');
  });

  it('collapses then re-shows pinyin when toggling annotationEnabled (cache persists)', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.annotationByIndex = { 0: { text: '你好', annotation: 'nǐ hǎo', status: 'done' } };
    // Disabled — element stays mounted but collapsed (so it can animate out)
    fixture.componentRef.setInput('annotationEnabled', false);
    fixture.detectChanges();
    const collapsed = (fixture.nativeElement as HTMLElement).querySelector('.annotation-line');
    expect(collapsed?.classList).toContain('annotation-line--hidden');
    // Toggle back to enabled — pinyin re-appears, cache entry still 'done'
    fixture.componentRef.setInput('annotationEnabled', true);
    fixture.detectChanges();
    const shown = (fixture.nativeElement as HTMLElement).querySelector('.annotation-line');
    expect(shown?.classList).not.toContain('annotation-line--hidden');
    expect(shown?.textContent).toContain('nǐ hǎo');
    expect(c.annotationByIndex[0].status).toBe('done');
  });
});

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

  it('auto-scrolls to the active line', fakeAsync(() => {
    renderSynced();
    (Element.prototype.scrollIntoView as jest.Mock).mockClear();

    changeActiveLine(1);
    tick();

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  }));
});
