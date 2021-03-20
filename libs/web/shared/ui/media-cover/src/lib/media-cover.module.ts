import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaCoverComponent } from './media-cover.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MediaCoverComponent],
  exports: [MediaCoverComponent]
})
export class MediaCoverModule {}
