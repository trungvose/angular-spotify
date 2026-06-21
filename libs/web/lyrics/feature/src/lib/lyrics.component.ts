import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LyricsStore, PinyinStore } from '@angular-spotify/web/lyrics/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

@Component({
  selector: 'as-lyrics',
  templateUrl: './lyrics.component.html',
  styleUrls: ['./lyrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LyricsComponent {
  lyrics$ = this.lyricsStore.lyrics$;
  activeLine$ = this.lyricsStore.activeLine$;
  isSynced$ = this.lyricsStore.isSynced$;
  status$ = this.lyricsStore.status$;
  pinyinByIndex$ = this.pinyinStore.pinyinByIndex$;

  constructor(
    private lyricsStore: LyricsStore,
    private playerApi: PlayerApiService,
    private pinyinStore: PinyinStore
  ) {}

  onSeekTo(positionMs: number): void {
    this.playerApi.seek(positionMs).subscribe();
  }

  onVisibleRangeChange(range: { start: number; end: number }): void {
    this.pinyinStore.setVisibleRange(range);
  }
}
