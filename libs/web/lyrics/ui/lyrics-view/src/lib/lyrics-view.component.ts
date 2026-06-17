import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { LyricLine } from '@angular-spotify/web/lyrics/data-access';

@Component({
  selector: 'as-lyrics-view',
  templateUrl: './lyrics-view.component.html',
  styleUrls: ['./lyrics-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LyricsViewComponent implements OnChanges {
  @Input() lyrics: LyricLine[] | null = null;
  @Input() activeLine = -1;
  @Input() isSynced = false;
  @Output() seekTo = new EventEmitter<number>();
  @ViewChildren('lyricLine') lyricLines!: QueryList<ElementRef>;

  userControlling = false;

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
