import {
  VolumeHighIcon,
  VolumeMediumIcon,
  VolumeMuteIcon
} from '@angular-spotify/web/shared/data-access/models';
import { PlaybackService, PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzSliderValue } from 'ng-zorro-antd/slider';
import { Subject } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'as-player-volume',
  templateUrl: 'player-volume.component.html',
  styleUrls: ['player-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerVolumeComponent {
  setVolume$ = new Subject<number>();
  volume$ = this.playbackStore.volume$;
  /** Holds the value of volume. */
  private _volume!: number;
  volumeIcon$ = this.volume$.pipe(
    map((volume) => volume * 100),
    map((volume) => {
      if (volume >= 70) {
        return new VolumeHighIcon(volume);
      }
      if (volume > 0) {
        return new VolumeMediumIcon(volume);
      }
      return new VolumeMuteIcon();
    })
  );
  /** Holds the value of volume before muted. */
  private _mutedVolume!: number;

  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
    this.setVolume$
      .pipe(
        debounceTime(50),
        switchMap((volume) => this.playbackService.setVolume(volume)),
        untilDestroyed(this)
      )
      .subscribe();

    this.volume$.subscribe((volume) => this._volume = volume);
  }

  toggleMute() {
    if (this._volume > 0) {
      this._mutedVolume = this._volume;
      this.setVolume$.next(0);
    } else {
      this.setVolume$.next(this._mutedVolume);
    }
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
