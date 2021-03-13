import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistComponent } from './playlist.component';
import { AlbumSummaryModule } from '@angular-spotify/web/shared/ui/album-summary';
@NgModule({
  imports: [
    CommonModule,
    AlbumSummaryModule,
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
