import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationPipePipe } from './duration-pipe.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [DurationPipePipe],
  exports: [DurationPipePipe]
})
export class DurationPipeModule {}
