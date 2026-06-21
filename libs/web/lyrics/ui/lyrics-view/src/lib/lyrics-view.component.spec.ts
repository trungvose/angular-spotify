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

  it('collapses pinyin lines when pinyinEnabled is false (kept mounted to animate out)', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: 'nǐ hǎo', status: 'done' } };
    c.pinyinEnabled = false;
    fixture.detectChanges();
    const line = (fixture.nativeElement as HTMLElement).querySelector('.pinyin-line');
    expect(line).not.toBeNull();
    expect(line?.classList).toContain('pinyin-line--hidden');
    expect(line?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows pinyin lines when pinyinEnabled is true with a done entry', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: 'nǐ hǎo', status: 'done' } };
    c.pinyinEnabled = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.pinyin-line')?.textContent).toContain('nǐ hǎo');
  });

  it('collapses then re-shows pinyin when toggling pinyinEnabled (cache persists)', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: 'nǐ hǎo', status: 'done' } };
    // Disabled — element stays mounted but collapsed (so it can animate out)
    fixture.componentRef.setInput('pinyinEnabled', false);
    fixture.detectChanges();
    const collapsed = (fixture.nativeElement as HTMLElement).querySelector('.pinyin-line');
    expect(collapsed?.classList).toContain('pinyin-line--hidden');
    // Toggle back to enabled — pinyin re-appears, cache entry still 'done'
    fixture.componentRef.setInput('pinyinEnabled', true);
    fixture.detectChanges();
    const shown = (fixture.nativeElement as HTMLElement).querySelector('.pinyin-line');
    expect(shown?.classList).not.toContain('pinyin-line--hidden');
    expect(shown?.textContent).toContain('nǐ hǎo');
    expect(c.pinyinByIndex[0].status).toBe('done');
  });
});
