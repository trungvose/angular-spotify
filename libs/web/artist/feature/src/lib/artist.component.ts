import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArtistStore } from '@angular-spotify/web/artist/data-access';

@Component({
  selector: 'as-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ArtistStore]
})
export class ArtistComponent {
  artist$ = this.artistStore.artist$;
  isArtistLoading$ = this.artistStore.isArtistLoading$;

  constructor(private artistStore: ArtistStore) {}
}