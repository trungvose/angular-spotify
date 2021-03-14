import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NowPlayingBarComponent } from './now-playing-bar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NowPlayingBarComponent],
  exports: [NowPlayingBarComponent]
})
export class NowPlayingBarModule {}
