import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlbumStore } from '@angular-spotify/web/album/data-access';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';

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
export class AlbumComponent implements OnInit {
  album$ = this.store.album$;
  isAlbumLoading$ = this.store.isCurrentAlbumLoading$;
  isAlbumPlaying$ = this.store.isAlbumPlaying$;

  constructor(
    private store: AlbumStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.album$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((album) => {
      const ids = (album?.tracks?.items ?? [])
        .map((track) => track.id)
        .filter((id): id is string => !!id);
      if (ids.length) {
        this.savedTracksStore.checkSaved(ids);
      }
    });
  }

  toggleAlbum(isPlaying: boolean, uri: string) {
    this.store.toggleAlbum({
      isPlaying,
      uri
    });
  }
}
