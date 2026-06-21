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
