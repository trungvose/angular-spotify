import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { PlaylistsComponent } from './playlists.component';
import { PlaylistListComponent } from '@angular-spotify/web/shared/ui/playlist-list';
export const playlistsRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaylistsComponent
      }
    ]),
    PlaylistListComponent,
  ],
  declarations: [PlaylistsComponent],
  exports: [PlaylistsComponent]
})
export class PlaylistsModule {}
