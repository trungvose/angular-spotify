import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { asHomeIcon } from './svg/home';
import { asStepBackwardIcon } from './svg/step-backward';
import { asStepForwardIcon } from './svg/step-forward';
import { asPauseIcon } from './svg/pause';
import { asPlayIcon } from './svg/play';

@NgModule({
  imports: [
    CommonModule,
    SvgIconsModule.forRoot({
      icons: [asHomeIcon, asStepBackwardIcon, asStepForwardIcon, asPauseIcon, asPlayIcon]
    })
  ],
  exports: [SvgIconsModule]
})
export class IconModule {}
