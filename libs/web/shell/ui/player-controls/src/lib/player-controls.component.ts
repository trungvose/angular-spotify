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
  isPlaying$: Observable<boolean | null>;
  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
    this.isPlaying$ = this.playbackStore.isPlaying$.pipe(startWith(false));
  }

  async togglePlay() {
    this.playbackService.play();
  }

  async next() {
    this.playbackService.next();
  }

  async prev() {
    this.playbackService.prev();
  }
}
