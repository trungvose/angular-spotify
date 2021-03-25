import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { asHomeIcon } from './svg/home';
import { asStepBackwardIcon } from './svg/step-backward';
import { asStepForwardIcon } from './svg/step-forward';
import { asPauseIcon } from './svg/pause';
import { asPlayIcon } from './svg/play';
import { asVolumeHighIcon } from './svg/volume-high';
import { asVolumeMediumIcon } from './svg/volume-medium';
import { asVolumeMuteIcon } from './svg/volume-mute';
import { asClockIcon } from './svg/clock';
import { asAudioAnimatedIcon } from './svg/audio-animated';

@NgModule({
  imports: [
    CommonModule,
    SvgIconsModule.forRoot({
      icons: [
        asHomeIcon,
        asStepBackwardIcon,
        asStepForwardIcon,
        asPauseIcon,
        asPlayIcon,
        asVolumeHighIcon,
        asVolumeMediumIcon,
        asVolumeMuteIcon,
        asClockIcon,
        asAudioAnimatedIcon
      ]
    })
  ],
  exports: [SvgIconsModule]
})
export class IconModule {}
