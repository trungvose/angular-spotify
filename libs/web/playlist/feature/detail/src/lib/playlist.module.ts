import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { PlaylistTrackModule } from '@angular-spotify/web/playlist/ui/playlist-track';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { PlaylistComponent } from './playlist.component';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { ReactiveComponentModule } from '@ngrx/component';
import { TracksLoadingModule } from '@angular-spotify/web/shared/ui/tracks-loading';
@NgModule({
  imports: [
    CommonModule,
    MediaSummaryModule,
    PlayButtonModule,
    MediaTableModule,
    PlaylistTrackModule,
    SvgIconsModule,
    ReactiveComponentModule,
    TracksLoadingModule,
    RouterModule.forChild([
      {
        path: `:${RouterUtil.Configuration.PlaylistId}`,
        component: PlaylistComponent
      }
    ])
  ],
  declarations: [PlaylistComponent],
  exports: [PlaylistComponent]
})
export class PlaylistModule {}
