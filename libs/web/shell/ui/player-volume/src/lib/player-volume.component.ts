import {
  VolumeHighIcon,
  VolumeIcon,
  VolumeMediumIcon,
  VolumeMuteIcon
} from '@angular-spotify/web/shared/data-access/models';
import { PlaybackService, PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzSliderValue } from 'ng-zorro-antd/slider';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
@UntilDestroy()
@Component({
  selector: 'as-player-volume',
  templateUrl: 'player-volume.component.html',
  styleUrls: ['player-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerVolumeComponent {
  setVolume$ = new Subject<number>();
  volume$: Observable<number>;
  volumeIcon$: Observable<VolumeIcon>;

  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
    this.volume$ = this.playbackStore.volume$;
    this.volumeIcon$ = this.volume$.pipe(
      map((volume) => volume * 100),
      map((volume) => {
        if (volume >= 70) {
          return new VolumeHighIcon(volume);
        } else if (volume > 0) {
          return new VolumeMediumIcon(volume);
        } else {
          return new VolumeMuteIcon();
        }
      })
    );

    this.setVolume$
      .pipe(
        debounceTime(50),
        switchMap((volume) => this.playbackService.setVolume(volume)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  toggleMute() {
    this.setVolume$.next(0);
  }

  async changeVolume(positions: NzSliderValue) {
    if (typeof positions === 'number') {
      this.setVolume$.next(positions);
    }
    if (Array.isArray(positions)) {
      this.setVolume$.next(positions[positions.length - 1]);
    }
  }
}
