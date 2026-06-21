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
