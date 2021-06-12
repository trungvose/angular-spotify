import { Component } from '@angular/core';
import { ArtistTopTracksStore } from '@angular-spotify/web/artist/data-access';

@Component({
  selector: 'as-artist-top-tracks',
  template: `
    <h2 class="text-heading mt-2 mb-4">Popular</h2>
    <ng-container *ngIf="vm$ | async as vm">
      <as-artist-top-track
        *ngFor="let track of vm.data?.tracks; let idx = index"
        [order]="idx + 1"
        [track]="track"
      ></as-artist-top-track>
    </ng-container>
  `,
  providers: [ArtistTopTracksStore]
})
export class ArtistTopTracksComponent {
  readonly vm$ = this.store.vm$;
  constructor(private readonly store: ArtistTopTracksStore) {}
}
