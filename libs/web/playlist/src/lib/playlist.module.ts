import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistComponent } from './playlist.component';
import { AlbumSummaryModule } from '@angular-spotify/web/shared/ui/album-summary';
import { TrackMainInfoModule } from '@angular-spotify/web/shared/ui/track-main-info';
@NgModule({
  imports: [
    CommonModule,
    AlbumSummaryModule,
    TrackMainInfoModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaylistComponent
      }
    ])
  ],
  declarations: [PlaylistComponent],
  exports: [PlaylistComponent]
})
export class PlaylistModule {}
