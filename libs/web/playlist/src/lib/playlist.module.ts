import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistComponent } from './playlist.component';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { TrackMainInfoModule } from '@angular-spotify/web/shared/ui/track-main-info';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
@NgModule({
  imports: [
    CommonModule,
    MediaSummaryModule,
    TrackMainInfoModule,
    DurationPipeModule,
    PlayButtonModule,
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
