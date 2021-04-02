import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'as-album-art-overlay',
  templateUrl: './album-art-overlay.component.html',
  styleUrls: ['./album-art-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumArtOverlayComponent {
  albumBackgroundImage$ = this.playbackStore.currentTrack$.pipe(
    map((track) => {
      if (!track?.album?.images) {
        return null;
      }
      const imageUrl = track.album.images[0]?.url;
      return imageUrl ? `url(${imageUrl})` : null;
    })
  );

  constructor(private playbackStore: PlaybackStore) {}
}
