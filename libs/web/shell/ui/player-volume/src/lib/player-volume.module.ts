import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerVolumeComponent } from './player-volume.component';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '@ngneat/svg-icon';

@NgModule({
  imports: [CommonModule, FormsModule, NzSliderModule, SvgIconComponent],
  declarations: [PlayerVolumeComponent],
  exports: [PlayerVolumeComponent]
})
export class PlayerVolumeModule {}
