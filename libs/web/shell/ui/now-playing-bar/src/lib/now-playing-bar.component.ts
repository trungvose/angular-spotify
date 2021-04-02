import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({
  selector: 'as-now-playing-bar',
  templateUrl: './now-playing-bar.component.html',
  styleUrls: ['./now-playing-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingBarComponent {
  currentTrack$ = this.playbackStore.currentTrack$;

  constructor(private playbackStore: PlaybackStore) {
  }
}
