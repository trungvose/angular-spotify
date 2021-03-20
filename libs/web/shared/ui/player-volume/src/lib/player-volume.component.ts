import {
  VolumeHighIcon,
  VolumeIcon,
  VolumeMediumIcon,
  VolumeMuteIcon
} from '@angular-spotify/web/shared/data-access/models';
import { PlaybackService, PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzSliderValue } from 'ng-zorro-antd/slider';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
  selector: 'as-player-volume',
  templateUrl: 'player-volume.component.html',
  styleUrls: ['player-volume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerVolumeComponent {
  volume$: Observable<number>;
  volumeIcon$: Observable<VolumeIcon>;

  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
    this.volume$ = this.playbackStore.volume$;
    this.volumeIcon$ = this.volume$.pipe(
      map((volume) => volume * 100),
      map((volume) => {
        if (volume >= 80) {
          return new VolumeHighIcon(volume);
        } else if (volume >= 0) {
          return new VolumeMediumIcon(volume);
        } else {
          return new VolumeMuteIcon();
        }
      })
    );
  }

  async toggleMute() {
    await this.playbackService.setVolume(0.01);
  }

  async changeVolume(positions: NzSliderValue) {
    if (typeof positions === 'number') {
      await this.playbackService.setVolume(positions);
    }
    if (Array.isArray(positions)) {
      await this.playbackService.setVolume(positions[positions.length - 1]);
    }
  }
}
