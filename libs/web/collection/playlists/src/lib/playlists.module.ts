import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { PlaylistsComponent } from './playlists.component';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';

export const playlistsRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    MediaModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaylistsComponent
      }
    ])
  ],
  declarations: [PlaylistsComponent],
  exports: [PlaylistsComponent]
})
export class PlaylistsModule {}
