import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { PlaylistsComponent } from './playlists.component';
import { AlbumModule } from '@angular-spotify/web/shared/ui/album';

export const playlistsRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    AlbumModule,
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
