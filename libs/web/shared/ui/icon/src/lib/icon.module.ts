import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SvgIconComponent, provideSvgIcons } from '@ngneat/svg-icon';
import { asAudioAnimatedIcon } from './svg/audio-animated';
import { asCaretDownFillIcon } from './svg/caret-down-fill';
import { asClockIcon } from './svg/clock';
import { asCompassIcon } from './svg/compass';
import { asCompassFillIcon } from './svg/compass-fill';
import { asCupIcon } from './svg/cup';
import { asCupFillIcon } from './svg/cup-fill';
import { asCupStrawIcon } from './svg/cup-straw';
import { asEmojiHeartEyesIcon } from './svg/emoji-heart-eyes';
import { asExpandIcon } from './svg/expand';
import { asGithubIcon } from './svg/github';
import { asHeartIcon } from './svg/heart';
import { asHeartFillIcon } from './svg/heart-fill';
import { asHomeIcon } from './svg/home';
import { asHouseDoorIcon } from './svg/house-door';
import { asHouseDoorFillIcon } from './svg/house-door-fill';
import { asJournalIcon } from './svg/journal';
import { asMusicNoteBeamedIcon } from './svg/music-note-beamed';
import { asMusicNoteListIcon } from './svg/music-note-list';
import { asPauseIcon } from './svg/pause';
import { asPlayIcon } from './svg/play';
import { asQuestionCircleIcon } from './svg/question-circle';
import { asSearchIcon } from './svg/search';
import { asSearchHeartIcon } from './svg/search-heart';
import { asShrinkIcon } from './svg/shrink';
import { asStepBackwardIcon } from './svg/step-backward';
import { asStepForwardIcon } from './svg/step-forward';
import { asTimesIcon } from './svg/times';
import { asTwitterIcon } from './svg/twitter';
import { asVolumeHighIcon } from './svg/volume-high';
import { asVolumeMediumIcon } from './svg/volume-medium';
import { asVolumeMuteIcon } from './svg/volume-mute';

@NgModule({
  imports: [CommonModule, SvgIconComponent],
  providers: [
    provideSvgIcons([
      asAudioAnimatedIcon,
      asCaretDownFillIcon,
      asClockIcon,
      asCompassFillIcon,
      asCompassIcon,
      asCupFillIcon,
      asCupIcon,
      asCupStrawIcon,
      asEmojiHeartEyesIcon,
      asExpandIcon,
      asGithubIcon,
      asHeartFillIcon,
      asHeartIcon,
      asHomeIcon,
      asHouseDoorFillIcon,
      asHouseDoorIcon,
      asJournalIcon,
      asMusicNoteBeamedIcon,
      asMusicNoteListIcon,
      asPauseIcon,
      asPlayIcon,
      asQuestionCircleIcon,
      asSearchHeartIcon,
      asSearchIcon,
      asShrinkIcon,
      asStepBackwardIcon,
      asStepForwardIcon,
      asTimesIcon,
      asTwitterIcon,
      asVolumeHighIcon,
      asVolumeMediumIcon,
      asVolumeMuteIcon
    ])
  ],
  exports: [SvgIconComponent]
})
export class IconModule {}
