import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'as-album-art-overlay',
  templateUrl: './album-art-overlay.component.html',
  styleUrls: ['./album-art-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumArtOverlayComponent {
  albumBackgroundImage$: Observable<string | null>;

  constructor(private playbackStore: PlaybackStore) {
    this.albumBackgroundImage$ = this.playbackStore.currentTrack$.pipe(
      map((track) => {
        if (!track?.album?.images) {
          return null;
        }
        return track.album.images[0]?.url;
      })
    );
  }

  getBackgroundUrl(url: string) {
    return `url(${url})`;
  }
}
