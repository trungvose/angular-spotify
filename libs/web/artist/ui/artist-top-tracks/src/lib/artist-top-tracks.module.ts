import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';
import { ArtistTopTracksComponent } from './artist-top-tracks.component';

@NgModule({
  imports: [CommonModule, DurationPipeModule],
  exports: [ArtistTopTracksComponent],
  declarations: [ArtistTopTracksComponent]
})
export class ArtistTopTracksModule {}
