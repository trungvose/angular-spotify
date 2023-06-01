import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturedPlaylistsComponent } from './featured-playlists.component';
import { CardComponent } from '@angular-spotify/web/shared/ui/media';

@NgModule({
  imports: [CommonModule, CardComponent],
  declarations: [FeaturedPlaylistsComponent],
  exports: [FeaturedPlaylistsComponent]
})
export class FeaturedPlaylistsModule {}
