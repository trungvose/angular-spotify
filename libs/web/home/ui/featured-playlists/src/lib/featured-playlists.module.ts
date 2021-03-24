import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturedPlaylistsComponent } from './featured-playlists.component';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';

@NgModule({
  imports: [CommonModule, MediaModule],
  declarations: [FeaturedPlaylistsComponent],
  exports: [FeaturedPlaylistsComponent]
})
export class FeaturedPlaylistsModule {}
