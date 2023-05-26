import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlbumStore } from '@angular-spotify/web/album/data-access';

@Component({
  selector: 'as-album',
  templateUrl: './album.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  providers: [AlbumStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumComponent {
  album$ = this.store.album$;
  isAlbumLoading$ = this.store.isCurrentAlbumLoading$;
  isAlbumPlaying$ = this.store.isAlbumPlaying$;

  constructor(private store: AlbumStore) {}

  toggleAlbum(isPlaying: boolean, uri: string) {
    this.store.toggleAlbum({
      isPlaying,
      uri
    });
  }
}
