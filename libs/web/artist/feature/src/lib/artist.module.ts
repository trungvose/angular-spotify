import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistComponent } from './artist.component';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { TracksLoadingComponent } from '@angular-spotify/web/shared/ui/tracks-loading';
import { ArtistTopTracksModule } from '@angular-spotify/web/artist/ui/artist-top-tracks';
@NgModule({
  imports: [
    CommonModule,
    WorkInProgressModule,
    RouterModule.forChild([
      {
        path: `:${RouterUtil.Configuration.ArtistId}`,
        component: ArtistComponent
      }
    ]),
    MediaSummaryModule,
    TracksLoadingComponent,
    ArtistTopTracksModule
  ],
  declarations: [ArtistComponent],
  exports: [ArtistComponent]
})
export class ArtistModule {}
