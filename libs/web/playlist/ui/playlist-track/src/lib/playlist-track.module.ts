import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistTrackComponent } from './playlist-track.component';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';
import { TrackMainInfoModule } from '@angular-spotify/web/shared/ui/track-main-info';
import { MediaOrderModule } from '@angular-spotify/web/shared/ui/media-order';
import { LetDirective, PushPipe } from '@ngrx/component';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MediaTableModule,
    DurationPipeModule,
    TrackMainInfoModule,
    MediaOrderModule,
    LetDirective, PushPipe
  ],
  declarations: [PlaylistTrackComponent],
  exports: [PlaylistTrackComponent]
})
export class PlaylistTrackModule {}
