import { Component } from '@angular/core';
import { ArtistTopTracksStore } from '@angular-spotify/web/artist/data-access';

@Component({
  selector: 'as-artist-top-tracks',
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ng-container *ngFor="let track of vm.data?.tracks; let i = index">
        <div class="flex justify-between items-center">
          <div>
            {{ i + 1 }}
          </div>
          <div class="flex-grow">
            {{ track.name }}
          </div>
          <div>
            {{ track.duration_ms | duration }}
          </div>
        </div>
      </ng-container>
    </ng-container>
  `,
  providers: [ArtistTopTracksStore]
})
export class WebArtistUiArtistTopTracksComponent {
  readonly vm$ = this.store.vm$;
  constructor(private readonly store: ArtistTopTracksStore) {}
}
