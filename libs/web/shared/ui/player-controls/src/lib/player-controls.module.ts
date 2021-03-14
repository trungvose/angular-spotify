import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { PlayerControlsComponent } from './player-controls.component';
@NgModule({
  imports: [CommonModule, SvgIconsModule],
  declarations: [PlayerControlsComponent],
  exports: [PlayerControlsComponent]
})
export class PlayerControlsModule {}
