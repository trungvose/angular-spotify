import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistComponent } from './artist.component';
import { WorkInProgressComponent } from '@angular-spotify/web/shared/ui/work-in-progress';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { MediaSummaryComponent } from '@angular-spotify/web/shared/ui/media-summary';
import { TracksLoadingComponent } from '@angular-spotify/web/shared/ui/tracks-loading';
import { ArtistTopTracksComponent } from 'libs/web/artist/ui/artist-top-tracks/src/lib/artist-top-tracks.component';
@NgModule({
  imports: [
    CommonModule,
    WorkInProgressComponent,
    RouterModule.forChild([
      {
        path: `:${RouterUtil.Configuration.ArtistId}`,
        component: ArtistComponent
      }
    ]),
    MediaSummaryComponent,
    TracksLoadingComponent,
    ArtistTopTracksComponent
  ],
  declarations: [ArtistComponent],
  exports: [ArtistComponent]
})
export class ArtistModule {}
