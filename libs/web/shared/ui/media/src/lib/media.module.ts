import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { MediaComponent } from './media.component';
@NgModule({
  imports: [CommonModule, MediaCoverModule, RouterModule],
  declarations: [MediaComponent],
  exports: [MediaComponent]
})
export class MediaModule {}
