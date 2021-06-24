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
import { asGithubIcon } from './svg/github';
import { asTwitterIcon } from './svg/twitter';
import { asQuestionCircleIcon } from './svg/question-circle';
import { asCupIcon } from './svg/cup';
import { asEmojiHeartEyesIcon } from './svg/emoji-heart-eyes';
import { asCupFillIcon } from './svg/cup-fill';
import { asCupStrawIcon } from './svg/cup-straw';
import { asCaretDownFillIcon } from './svg/caret-down-fill';
import { asTimesIcon } from './svg/times';
import { asExpandIcon } from './svg/expand';
import { asShrinkIcon } from './svg/shrink';
import { asSearchIcon } from './svg/search';

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
        asAudioAnimatedIcon,
        asGithubIcon,
        asTwitterIcon,
        asQuestionCircleIcon,
        asCupIcon,
        asCupFillIcon,
        asCupStrawIcon,
        asEmojiHeartEyesIcon,
        asCaretDownFillIcon,
        asTimesIcon,
        asExpandIcon,
        asShrinkIcon,
        asSearchIcon
      ]
    })
  ],
  exports: [SvgIconsModule]
})
export class IconModule {}
