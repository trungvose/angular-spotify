import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlbumStore } from '@angular-spotify/web/album/data-access';
import { toSignal } from '@angular/core/rxjs-interop';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AlbumComponent {
  album = toSignal(this.store.album$,{ initialValue: null });

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
