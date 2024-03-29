import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from './album.component';
import { RouterModule } from '@angular/router';
import { TracksLoadingComponent } from '@angular-spotify/web/shared/ui/tracks-loading';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { AlbumTrackModule } from '@angular-spotify/web/album/ui/album-track';
@NgModule({
  imports: [
    CommonModule,
    TracksLoadingComponent,
    MediaSummaryModule,
    PlayButtonModule,
    MediaTableModule,
    SvgIconComponent,
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
