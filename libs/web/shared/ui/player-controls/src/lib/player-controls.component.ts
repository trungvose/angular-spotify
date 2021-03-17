import { PlaybackService, PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
@Component({
  selector: 'as-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerControlsComponent {
  isPause$: Observable<boolean | undefined>;
  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
    this.isPause$ = this.playbackStore.isPause$.pipe(startWith(true));
  }

  async togglePlay() {
    await this.playbackService.play();
  }

  async next() {
    await this.playbackService.next();
  }

  async prev() {
    await this.playbackService.prev();
  }
}
