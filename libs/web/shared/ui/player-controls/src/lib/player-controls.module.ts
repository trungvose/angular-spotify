import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { PlayerControlsComponent } from './player-controls.component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
@NgModule({
  imports: [CommonModule, SvgIconsModule, PlayButtonModule],
  declarations: [PlayerControlsComponent],
  exports: [PlayerControlsComponent]
})
export class PlayerControlsModule {}
