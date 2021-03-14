import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
@Component({
  selector: 'as-player-playback',
  templateUrl: './player-playback.component.html',
  styleUrls: ['./player-playback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerPlaybackComponent {
  progress$: Observable<number>;
  max$: Observable<number>;

  constructor(private playbackStore: PlaybackStore) {
    this.progress$ = this.playbackStore.playback$.pipe(
      switchMap(({ paused, position }) => {
        if (!paused) {
          const progressTimer$ = timer(0, 1000);
          return progressTimer$.pipe(
            map((x) => x * 1000),
            map((x) => x + position)
          );
        }
        return of(position);
      })
    );
    this.max$ = this.playbackStore.playback$.pipe(map(({duration}) => duration));
  }
}
