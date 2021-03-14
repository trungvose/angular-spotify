import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackCurrentInfoComponent } from './track-current-info.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [TrackCurrentInfoComponent],
  exports: [TrackCurrentInfoComponent]
})
export class TrackCurrentInfoModule {}
