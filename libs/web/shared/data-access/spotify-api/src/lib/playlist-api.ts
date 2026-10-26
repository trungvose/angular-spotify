import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { SpotifyApiParams } from '@angular-spotify/web/shared/data-access/models';
import { map } from 'rxjs/operators';
import { SPOTIFY_DEFAULT_LIMIT } from './spotify-api.constant';

@Injectable({ providedIn: 'root' })
export class PlaylistApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  getUserSavedPlaylists(
    params: SpotifyApiParams = {
      limit: SPOTIFY_DEFAULT_LIMIT
    }
  ) {
    return this.http.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
      `${this.appConfig.baseURL}/me/playlists`,
      {
        params
      }
    );
  }

  getById(playlistId: string) {
    if (!playlistId) {
      throw new Error('Playlist Id is required');
    }
    return this.http.get<SpotifyApi.PlaylistObjectFull>(
      `${this.appConfig.baseURL}/playlists/${playlistId}`
    );
  }

  getTracks(playlistId: string, params: SpotifyApiParams = { limit: SPOTIFY_DEFAULT_LIMIT }) {
    if (!playlistId) {
      throw new Error('Playlist Id is required');
    }
    return this.http
      .get<SpotifyApi.PlaylistTrackResponse>(
        `${this.appConfig.baseURL}/playlists/${playlistId}/items`,
        { params }
      )
      .pipe(
        // The API now returns each entry's track under `item`; keep exposing it as `track`.
        map((response) => ({
          ...response,
          items: response.items.map((entry) => {
            const { item, ...rest } = entry as SpotifyApi.PlaylistTrackObject & {
              item?: SpotifyApi.PlaylistTrackObject['track'];
            };
            return { ...rest, track: item ?? rest.track } as SpotifyApi.PlaylistTrackObject;
          })
        }))
      );
  }
}
