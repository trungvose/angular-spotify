import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'as-now-playing-bar',
  templateUrl: './now-playing-bar.component.html',
  styleUrls: ['./now-playing-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingBarComponent implements OnInit {
  currentTrack$ = this.playbackStore.currentTrack$;

  constructor(
    private playbackStore: PlaybackStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.currentTrack$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((track) => {
        if (track?.id) {
          this.savedTracksStore.checkSaved([track.id]);
        }
      });
  }
}
