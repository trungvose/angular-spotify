import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TrackMainInfoComponent } from './track-main-info.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [TrackMainInfoComponent],
  exports: [TrackMainInfoComponent]
})
export class TrackMainInfoModule {}
