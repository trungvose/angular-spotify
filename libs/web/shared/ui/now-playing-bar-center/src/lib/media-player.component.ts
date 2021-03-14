import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
@Component({
  selector: 'as-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaPlayerComponent {
  isPause$: Observable<boolean | undefined>;
  constructor(private playbackStore: PlaybackStore) {
    this.isPause$ = this.playbackStore.isPause$;
  }
}
