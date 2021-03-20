import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { PlaylistTrackModule } from '@angular-spotify/web/shared/ui/playlist-track';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { PlaylistComponent } from './playlist.component';
@NgModule({
  imports: [
    CommonModule,
    MediaSummaryModule,
    PlayButtonModule,
    MediaTableModule,
    PlaylistTrackModule,
    SvgIconsModule,
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
