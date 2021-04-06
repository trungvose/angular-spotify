import { RouterUtil } from './router-util';

export class RouteUtil {
  static getAlbumRouteUrl(albumId: string) {
    return `/${RouterUtil.Configuration.Album}/${albumId}`;
  }
  static getArtistRouteUrl(artistId: string) {
    return `/${RouterUtil.Configuration.Artist}/${artistId}`;
  }

  static getPlaylistRouteUrl(playlistId: string) {
    return `/${RouterUtil.Configuration.Playlist}/${playlistId}`;
  }

  static getPlaylistContextUri(playlistId: string) {
    return `spotify:playlist:${playlistId}`;
  }
}
