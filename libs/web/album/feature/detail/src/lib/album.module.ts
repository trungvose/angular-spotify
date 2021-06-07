import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from './album.component';
import { RouterModule } from '@angular/router';
import { TracksLoadingModule } from '@angular-spotify/web/shared/ui/tracks-loading';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { AlbumTrackModule } from '@angular-spotify/web/album/ui/album-track';
@NgModule({
  imports: [
    CommonModule,
    TracksLoadingModule,
    MediaSummaryModule,
    PlayButtonModule,
    MediaTableModule,
    SvgIconsModule,
    AlbumTrackModule,
    RouterModule.forChild([
      {
        path: '',
        component: AlbumComponent
      }
    ])
  ],
  declarations: [AlbumComponent]
})
export class AlbumModule {}
