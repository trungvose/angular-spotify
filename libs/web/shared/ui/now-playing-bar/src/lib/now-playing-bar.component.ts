import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
@Component({
  selector: 'as-now-playing-bar',
  templateUrl: './now-playing-bar.component.html',
  styleUrls: ['./now-playing-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingBarComponent {
  currentTrack$: Observable<Spotify.Track | undefined>;

  constructor(private playbackStore: PlaybackStore) {
    this.currentTrack$ = this.playbackStore.currentTrack$;
  }
}
