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
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'as-player-volume',
  templateUrl: 'player-volume.component.html',
  styleUrls: ['player-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerVolumeComponent {
  private _volume!: number;
  volume$ = this.playbackStore.volume$.pipe(tap((volume) => (this._volume = volume)));
  setVolume$ = new Subject<number>();
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

  private _beforeMutedVolume!: number;

  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
    this.setVolume$
      .pipe(
        debounceTime(50),
        switchMap((volume) => this.playbackService.setVolume(volume)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  toggleMute() {
    if (this._volume > 0) {
      this._beforeMutedVolume = this._volume;
      this.setVolume$.next(0);
    } else {
      this.setVolume$.next(this._beforeMutedVolume);
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
