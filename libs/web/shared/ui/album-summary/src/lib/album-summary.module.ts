import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AlbumSummaryComponent } from './album-summary.component';
import { AlbumCoverModule } from '@angular-spotify/web/shared/ui/album-cover';

@NgModule({
  imports: [CommonModule, AlbumCoverModule],
  declarations: [AlbumSummaryComponent],
  exports: [AlbumSummaryComponent]
})
export class AlbumSummaryModule {}
