import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackCurrentInfoComponent } from './track-current-info.component';
import { RouterModule } from '@angular/router';
import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';

@NgModule({
  imports: [CommonModule, RouterModule, MediaCoverModule],
  declarations: [TrackCurrentInfoComponent],
  exports: [TrackCurrentInfoComponent]
})
export class TrackCurrentInfoModule {}
