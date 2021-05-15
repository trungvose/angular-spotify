import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebArtistUiArtistTopTracksComponent } from './web-artist-ui-artist-top-tracks.component';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';

@NgModule({
  imports: [CommonModule, DurationPipeModule],
  exports: [WebArtistUiArtistTopTracksComponent],
  declarations: [WebArtistUiArtistTopTracksComponent]
})
export class WebArtistUiArtistTopTracksModule {}
