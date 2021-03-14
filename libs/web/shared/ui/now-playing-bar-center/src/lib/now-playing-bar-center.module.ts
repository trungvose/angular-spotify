import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { MediaPlayerComponent } from './media-player.component';
@NgModule({
  imports: [CommonModule, SvgIconsModule],
  declarations: [MediaPlayerComponent],
  exports: [MediaPlayerComponent]
})
export class NowPlayingBarCenterModule {}
