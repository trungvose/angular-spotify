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

  it('hides pinyin lines when pinyinEnabled is false even if entry is done', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: 'nǐ hǎo', status: 'done' } };
    c.pinyinEnabled = false;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.pinyin-line')).toBeNull();
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

  it('re-shows pinyin when toggling pinyinEnabled back to true (cache persists)', () => {
    const c = fixture.componentInstance;
    c.lyrics = [{ time: 0, text: '你好' }];
    c.pinyinByIndex = { 0: { text: '你好', pinyin: 'nǐ hǎo', status: 'done' } };
    // Start with disabled — no pinyin shown
    fixture.componentRef.setInput('pinyinEnabled', false);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.pinyin-line')).toBeNull();
    // Toggle back to enabled — pinyin re-appears, cache entry still 'done'
    fixture.componentRef.setInput('pinyinEnabled', true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.pinyin-line')?.textContent).toContain('nǐ hǎo');
    expect(c.pinyinByIndex[0].status).toBe('done');
  });
});
