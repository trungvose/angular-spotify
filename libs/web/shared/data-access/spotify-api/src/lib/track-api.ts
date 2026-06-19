import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { SpotifyApiAudioAnalysisResponse, SpotifyApiParams } from '@angular-spotify/web/shared/data-access/models';
import { SPOTIFY_DEFAULT_LIMIT } from './spotify-api.constant';

@Injectable({ providedIn: 'root' })
export class TrackApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  getAudioAnalysis(trackId: string) {
    return this.http.get<SpotifyApiAudioAnalysisResponse>(
      `${this.appConfig.baseURL}/audio-analysis/${trackId}`
    );
  }

  getAudioFeatures(trackId: string) {
    return this.http.get<SpotifyApi.AudioAnalysisResponse>(
      `${this.appConfig.baseURL}/audio-features/${trackId}`
    );
  }

  getUserSavedTracks(
    params: SpotifyApiParams = {
      limit: SPOTIFY_DEFAULT_LIMIT
    }
  ) {
    return this.http.get<SpotifyApi.UsersSavedTracksResponse>(
      `${this.appConfig.baseURL}/me/tracks`,
      {
        params
      }
    );
  }

  saveTracks(ids: string[]) {
    return this.http.put<void>(`${this.appConfig.baseURL}/me/tracks`, null, {
      params: { ids: ids.join(',') }
    });
  }

  removeTracks(ids: string[]) {
    return this.http.delete<void>(`${this.appConfig.baseURL}/me/tracks`, {
      params: { ids: ids.join(',') }
    });
  }

  checkSavedTracks(ids: string[]) {
    return this.http.get<boolean[]>(
      `${this.appConfig.baseURL}/me/tracks/contains`,
      {
        params: { ids: ids.join(',') }
      }
    );
  }
}
