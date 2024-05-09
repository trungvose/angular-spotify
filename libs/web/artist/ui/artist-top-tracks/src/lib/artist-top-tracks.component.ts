import { Component } from '@angular/core';
import { ArtistTopTracksStore } from '@angular-spotify/web/artist/data-access';

@Component({
  selector: 'as-artist-top-tracks',
  template: `
    <h2 class="text-heading mt-2 mb-4">Popular</h2>
    @if (vm$ | async; as vm) {
      @for (track of vm.data?.tracks; track track; let idx = $index) {
        <as-artist-top-track
          [order]="idx + 1"
          [track]="track"
        ></as-artist-top-track>
      }
    }
    `,
  providers: [ArtistTopTracksStore]
})
export class ArtistTopTracksComponent {
  readonly vm$ = this.store.vm$;
  constructor(private readonly store: ArtistTopTracksStore) {}
}
