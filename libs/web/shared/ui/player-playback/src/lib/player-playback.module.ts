import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerPlaybackComponent } from './player-playback.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PlayerPlaybackComponent],
  exports: [PlayerPlaybackComponent]
})
export class PlayerPlaybackModule {}
