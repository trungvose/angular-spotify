/// <reference types="spotify-web-playback-sdk" />
import { RouteUtil, StringUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-track-current-info',
  templateUrl: './track-current-info.component.html',
  styleUrls: ['./track-current-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackCurrentInfoComponent {
  @Input() track: Spotify.Track | undefined;

  getAlbumRouteUrl(album: Spotify.Album) {
    const id = StringUtil.getIdFromUri(album.uri);
    return RouteUtil.getAlbumRouteUrl(id);
  }

  getArtistRouteUrl(artist: Spotify.Artist) {
    const id = StringUtil.getIdFromUri(artist.uri);
    return RouteUtil.getArtistRouteUrl(id);
  }
}
