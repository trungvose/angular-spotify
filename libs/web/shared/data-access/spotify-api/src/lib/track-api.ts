import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { SpotifyApiAudioAnalysisResponse, SpotifyApiParams } from '@angular-spotify/web/shared/data-access/models';

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
      limit: 50
    }
  ) {
    return this.http.get<SpotifyApi.UsersSavedTracksResponse>(
      `${this.appConfig.baseURL}/me/tracks`,
      {
        params
      }
    );
  }
}
