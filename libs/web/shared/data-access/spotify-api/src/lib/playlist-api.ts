import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';

@Injectable({ providedIn: 'root' })
export class PlaylistApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  getUserSavedPlaylists(offset = 0, limit = 50) {
    return this.http.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
      `${this.appConfig.baseURL}/me/playlists`, {
        params: {
          offset: `${offset}`,
          limit: `${limit}`
        }
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

  getTracks(playlistId: string) {
    if (!playlistId) {
      throw new Error('Playlist Id is required');
    }
    return this.http.get<SpotifyApi.PlaylistTrackResponse>(
      `${this.appConfig.baseURL}/playlists/${playlistId}/tracks`
    )
  }
}
