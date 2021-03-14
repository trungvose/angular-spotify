import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NowPlayingBarComponent } from './now-playing-bar.component';
import { NowPlayingBarCenterModule } from '@angular-spotify/web/shared/ui/now-playing-bar-center';
@NgModule({
  imports: [CommonModule, NowPlayingBarCenterModule],
  declarations: [NowPlayingBarComponent],
  exports: [NowPlayingBarComponent]
})
export class NowPlayingBarModule {}
