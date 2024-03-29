import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { PlayerControlsComponent } from './player-controls.component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
@NgModule({
  imports: [CommonModule, SvgIconComponent, PlayButtonModule],
  declarations: [PlayerControlsComponent],
  exports: [PlayerControlsComponent]
})
export class PlayerControlsModule {}
