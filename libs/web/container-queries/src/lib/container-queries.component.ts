import { MediaModule } from '@angular-spotify/web/shared/ui/media';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import * as mockAlbums from './albums.mock.json';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

@Component({
  selector: 'as-container-queries',
  standalone: true,
  imports: [MediaModule, CommonModule],
  template: `
    <div class="content-spacing">
      <h2 class="text-3xl text-white">Hello Melbourne 🇦🇺</h2>
      <as-media
        *ngFor="let item of albums.items"
        [title]="item.album.name"
        [uri]="item.album.uri"
        [description]="item.album.artists[0].name"
        [imageUrl]="item.album.images[0]?.url"
        [routerUrl]="item.album.id"
        (togglePlay)="togglePlay($event, item.album.uri)"
      >
      </as-media>
    </div>
  `
})
export class ContainerQueriesComponent {
  albums: SpotifyApi.UsersSavedAlbumsResponse = mockAlbums as any;
  playerApi = inject(PlayerApiService);

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
