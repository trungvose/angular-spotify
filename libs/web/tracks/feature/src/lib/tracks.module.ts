import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TracksComponent } from './tracks.component';
import { TracksLoadingComponent } from '@angular-spotify/web/shared/ui/tracks-loading';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { PlaylistTrackComponent } from '@angular-spotify/web/playlist/ui/playlist-track';
import { WorkInProgressComponent } from '@angular-spotify/web/shared/ui/work-in-progress';
import { MediaSummaryComponent } from '@angular-spotify/web/shared/ui/media-summary';
@NgModule({
  imports: [
    CommonModule,
    WorkInProgressComponent,
    RouterModule.forChild([
      {
        path: '',
        component: TracksComponent
      }
    ]),
    TracksLoadingComponent,
    MediaSummaryComponent,
    MediaTableModule,
    SvgIconComponent,
    PlaylistTrackComponent,
  ],
  declarations: [TracksComponent],
  exports: [TracksComponent]
})
export class TracksModule {}
