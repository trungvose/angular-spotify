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

@Component({
  selector: 'as-lyrics-view',
  templateUrl: './lyrics-view.component.html',
  styleUrls: ['./lyrics-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
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
