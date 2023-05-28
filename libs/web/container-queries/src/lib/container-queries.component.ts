import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { DataSizeObserverDirective } from '@angular-spotify/web/shared/directives/data-size-observer';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import * as mockAlbums from './albums.mock.json';

@Component({
  selector: 'as-container-queries',
  standalone: true,
  imports: [MediaModule, CommonModule, DataSizeObserverDirective],
  template: `
    <div class="content-spacing">
      <h1 class="text-3xl text-white">Hello Melbourne 🇦🇺</h1>
      <div class="grid gap-6">
        <section class="grid grid-cols-3 gap-6">
          <as-media
            *ngFor="let item of featureAlbums"
            [title]="item.album.name"
            [uri]="item.album.uri"
            [description]="item.album.artists[0].name"
            [imageUrl]="item.album.images[0]?.url"
            [routerUrl]="item.album.id"
            (togglePlay)="togglePlay($event, item.album.uri)"
          >
          </as-media>
        </section>
        <section class="common-grid">
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
        </section>
      </div>
    </div>
  `
})
export class ContainerQueriesComponent {
  albums: SpotifyApi.UsersSavedAlbumsResponse = mockAlbums as any;
  featureAlbums = this.albums.items.slice(0, 3);
  playerApi = inject(PlayerApiService);

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
