import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from './album.component';
import { RouterModule } from '@angular/router';
import { TracksLoadingComponent } from '@angular-spotify/web/shared/ui/tracks-loading';
import { MediaSummaryComponent } from '@angular-spotify/web/shared/ui/media-summary';
import { PlayButtonComponent } from '@angular-spotify/web/shared/ui/play-button';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { AlbumTrackComponent } from '@angular-spotify/web/album/ui/album-track';
@NgModule({
  imports: [
    CommonModule,
    TracksLoadingComponent,
    MediaSummaryComponent,
    PlayButtonComponent,
    MediaTableModule,
    SvgIconComponent,
    AlbumTrackComponent,
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
