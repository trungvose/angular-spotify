import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';
import { ArtistTopTracksComponent } from './artist-top-tracks.component';
import { ArtistTopTrackModule } from '@angular-spotify/web/artist/ui/artist-top-track';

@NgModule({
  imports: [CommonModule, DurationPipeModule, ArtistTopTrackModule],
  exports: [ArtistTopTracksComponent],
  declarations: [ArtistTopTracksComponent]
})
export class ArtistTopTracksModule {}
