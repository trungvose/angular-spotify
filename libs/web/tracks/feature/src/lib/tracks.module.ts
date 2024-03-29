import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TracksComponent } from './tracks.component';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';
import { TracksLoadingComponent } from '@angular-spotify/web/shared/ui/tracks-loading';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { PlaylistTrackModule } from '@angular-spotify/web/playlist/ui/playlist-track';
@NgModule({
  imports: [
    CommonModule,
    WorkInProgressModule,
    RouterModule.forChild([
      {
        path: '',
        component: TracksComponent
      }
    ]),
    TracksLoadingComponent,
    MediaSummaryModule,
    MediaTableModule,
    SvgIconComponent,
    PlaylistTrackModule,
  ],
  declarations: [TracksComponent],
  exports: [TracksComponent]
})
export class TracksModule {}
