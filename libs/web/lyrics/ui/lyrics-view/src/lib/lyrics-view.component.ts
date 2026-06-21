import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LyricLine, PinyinLineState } from '@angular-spotify/web/lyrics/data-access';

@Component({
  selector: 'as-lyrics-view',
  templateUrl: './lyrics-view.component.html',
  styleUrls: ['./lyrics-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LyricsViewComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() lyrics: LyricLine[] | null = null;
  @Input() activeLine = -1;
  @Input() isSynced = false;
  @Input() pinyinByIndex: Record<number, PinyinLineState> = {};
  @Input() pinyinEnabled = true;
  @Output() seekTo = new EventEmitter<number>();
  @Output() visibleRangeChange = new EventEmitter<{ start: number; end: number }>();
  @ViewChildren('lyricLine') lyricLines!: QueryList<ElementRef>;

  private observer: IntersectionObserver | null = null;
  private visible = new Set<number>();
  private lineChangesSub: Subscription | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeLine'] && this.isSynced && this.activeLine >= 0) {
      this.scrollToActiveLine();
    }
  }

  onLineClick(line: LyricLine): void {
    if (this.isSynced && line.time !== null) {
      this.seekTo.emit(line.time);
    }
  }

  pinyinFor(index: number): string | null {
    // Returns rendered pinyin regardless of the enabled flag — visibility is
    // handled with a CSS collapse class so hiding can animate out. The element
    // stays mounted (cache persists) so re-enabling is instant.
    const entry = this.pinyinByIndex[index];
    return entry && entry.status === 'done' ? entry.pinyin : null;
  }

  ngAfterViewInit(): void {
    if (this.isSynced || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const idx = Number((e.target as HTMLElement).dataset['index']);
        if (e.isIntersecting) {
          this.visible.add(idx);
        } else {
          this.visible.delete(idx);
        }
      }
      if (this.visible.size > 0) {
        const sorted = [...this.visible].sort((a, b) => a - b);
        this.visibleRangeChange.emit({ start: sorted[0], end: sorted[sorted.length - 1] });
      }
    });
    this.observer = observer;

    const attachObserver = () => {
      observer.disconnect();
      this.visible.clear();
      this.lyricLines.forEach((ref, i) => {
        (ref.nativeElement as HTMLElement).dataset['index'] = String(i);
        observer.observe(ref.nativeElement);
      });
    };

    attachObserver();
    this.lineChangesSub = this.lyricLines.changes.subscribe(() => attachObserver());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.lineChangesSub?.unsubscribe();
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
