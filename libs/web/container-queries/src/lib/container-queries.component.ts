import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { DataSizeObserverDirective } from '@angular-spotify/web/shared/directives/data-size-observer';
import { CardComponent } from '@angular-spotify/web/shared/ui/media';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import * as mockAlbums from './albums.mock.json';

@Component({
  selector: 'as-container-queries',
  standalone: true,
  imports: [CardComponent, CommonModule, DataSizeObserverDirective],
  styles: [
    `
      .featured-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    `
  ],
  template: `
    <div class="content-spacing">
      <h1 class="text-3xl text-white">Hello Melbourne 🇦🇺</h1>
      <div class="grid gap-6">
        <section class="featured-grid gap-6">
          <ng-container
            *ngTemplateOutlet="cards; context: { albums: featureAlbumsTwo }"
          ></ng-container>
        </section>
        <section class="featured-grid gap-6">
          <ng-container
            *ngTemplateOutlet="cards; context: { albums: featureAlbumsThree }"
          ></ng-container>
        </section>
        <section class="common-grid gap-6">
          <ng-container *ngTemplateOutlet="cards; context: { albums: albums }"></ng-container>
        </section>
      </div>
    </div>

    <ng-template #cards let-albums="albums">
      <as-card
        *ngFor="let item of albums"
        [title]="item.album.name"
        [uri]="item.album.uri"
        [description]="item.album.artists[0].name"
        [imageUrl]="item.album.images[0]?.url"
        [routerUrl]="item.album.id"
        (togglePlay)="togglePlay($event, item.album.uri)"
      >
      </as-card>
    </ng-template>
  `
})
export class ContainerQueriesComponent {
  response = mockAlbums as SpotifyApi.UsersSavedAlbumsResponse;
  featureAlbumsTwo = this.response.items.slice(0, 2);
  featureAlbumsThree = this.response.items.slice(2, 5);
  albums = this.response.items.slice(6);
  playerApi = inject(PlayerApiService);

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
