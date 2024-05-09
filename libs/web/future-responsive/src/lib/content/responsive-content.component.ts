import { CardComponent } from '@angular-spotify/web/shared/ui/media';
import { Component, inject } from '@angular/core';
import * as mockAlbums from '../albums.mock.json';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { CommonModule } from '@angular/common';
import { FlexFormComponent } from './flex-form.component';
import {
  DataSizeObserverDirective,
  ResizableDirective
} from '@angular-spotify/web/shared/directives/data-size-observer';

@Component({
  standalone: true,
  imports: [
    CardComponent,
    CommonModule,
    FlexFormComponent,
    DataSizeObserverDirective,
    ResizableDirective
  ],
  selector: 'as-responsive-to-content',
  styles: [
    `
      .section-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      }

      .section-title {
        @apply text-white text-xl;
      }

      .section-more {
        @apply text-gray-300 text-lg;
      }
    `
  ],
  template: `
    <!-- <h2 class="text-2xl text-white">1. Responsive to the content</h2> -->
    <div class="grid grid-cols-[2fr_1fr] gap-6">
      <div class="top-albums">
        <div class="section-header">
          <h3 class="section-title">Top Albums</h3>
          <a class="section-more" href="#">See All</a>
        </div>
        <hr class="py-2" />
        <section class="common-grid gap-6">
          <ng-container *ngTemplateOutlet="cards; context: { albums: topAlbums }"></ng-container>
        </section>
      </div>
      <div class="feature-albums">
        <div class="section-header">
          <h3 class="section-title">Based on your listening history</h3>
          <a class="section-more" href="#">See All</a>
        </div>
        <hr class="py-2" />
        <section class="common-grid gap-6">
          <ng-container
            *ngTemplateOutlet="cards; context: { albums: featureAlbums }"
          ></ng-container>
        </section>
      </div>
    </div>
    
    <div class="w-[632px] mx-auto py-10 px-4 mt-20" dataSizeObserver [top]="true" resizable>
      <as-flex-form  />
    </div>
    
    <ng-template #cards let-albums="albums">
      @for (item of albums; track item) {
        <as-card
          [title]="item.album.name"
          [uri]="item.album.uri"
          [description]="item.album.artists[0].name"
          [imageUrl]="item.album.images[0]?.url"
          [routerUrl]="item.album.id"
          (togglePlay)="togglePlay($event, item.album.uri)"
          >
        </as-card>
      }
    </ng-template>
    `
})
export class ResponsiveToContentComponent {
  response = mockAlbums as SpotifyApi.UsersSavedAlbumsResponse;
  topAlbums = this.response.items.slice(0, 8);
  featureAlbums = this.response.items.slice(8, 12);

  playerApi = inject(PlayerApiService);

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
