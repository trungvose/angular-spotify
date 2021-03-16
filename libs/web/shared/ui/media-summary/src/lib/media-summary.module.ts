import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { MediaSummaryComponent } from './media-summary.component';

@NgModule({
  imports: [CommonModule, MediaCoverModule],
  declarations: [MediaSummaryComponent],
  exports: [MediaSummaryComponent]
})
export class MediaSummaryModule {}
