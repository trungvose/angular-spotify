import { RouterUtil } from './router-util';

export class RouteUtil {
  static getArtistRouteUrl(artist: SpotifyApi.ArtistObjectSimplified) {
    return `/${RouterUtil.Configuration.Artist}/${artist.id}`;
  }

  static getPlaylistRouteUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return `/${RouterUtil.Configuration.Playlist}/${playlist.id}`;
  }
}
