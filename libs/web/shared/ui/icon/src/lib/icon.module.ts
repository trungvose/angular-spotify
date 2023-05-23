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
import { asSearchIcon } from './svg/search';
import { asCompassIcon } from './svg/compass';
import { asCompassFillIcon } from './svg/compass-fill';
import { asHouseDoorIcon } from './svg/house-door';
import { asHouseDoorFillIcon } from './svg/house-door-fill';
import { asHeartIcon } from './svg/heart';
import { asHeartFillIcon } from './svg/heart-fill';
import { asSearchHeartIcon } from './svg/search-heart';
import { asMusicNoteListIcon } from './svg/music-note-list';
import { asJournalIcon } from './svg/journal';
import { asMusicNoteBeamedIcon } from './svg/music-note-beamed';

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
        asSearchIcon,
        asCompassFillIcon,
        asCompassIcon,
        asHouseDoorIcon,
        asHouseDoorFillIcon,
        asHeartIcon,
        asHeartFillIcon,
        asSearchHeartIcon,
        asMusicNoteListIcon,
        asJournalIcon,
        asMusicNoteBeamedIcon
      ]
    })
  ],
  exports: [SvgIconsModule]
})
export class IconModule {}
