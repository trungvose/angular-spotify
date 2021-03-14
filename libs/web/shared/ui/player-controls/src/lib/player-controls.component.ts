import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
@Component({
  selector: 'as-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerControlsComponent {
  isPause$: Observable<boolean | undefined>;
  constructor(private playbackStore: PlaybackStore) {
    this.isPause$ = this.playbackStore.isPause$;
  }
}
