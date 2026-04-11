import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  SpotifyApiRecentPlayerTracksResponse,
  SpotifyPlayRequestApi
} from '@angular-spotify/web/shared/data-access/models';
import { SPOTIFY_DEFAULT_LIMIT } from './spotify-api.constant';
@Injectable({ providedIn: 'root' })
export class PlayerApiService {
  playerUrl: string;
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {
    this.playerUrl = `${this.appConfig.baseURL}/me/player`;
  }

  transferUserPlayback(deviceId: string) {
    return this.http.put(this.playerUrl, {
      device_ids: [deviceId],
      //play: true
    });
  }

  play(request: SpotifyPlayRequestApi) {
    const { device_id, ...body } = request;
    return device_id
      ? this.http.put(`${this.playerUrl}/play`, body, { params: { device_id } })
      : this.http.put(`${this.playerUrl}/play`, body);
  }

  pause() {
    return this.http.put(`${this.playerUrl}/pause`, {});
  }

  togglePlay(isPlaying: boolean, request: SpotifyPlayRequestApi) {
    if (isPlaying) {
      return this.pause();
    }
    return this.play(request);
  }

  next() {
    return this.http.post(`${this.playerUrl}/next`, {});
  }

  prev() {
    return this.http.post(`${this.playerUrl}/previous`, {});
  }

  seek(positionMs: number) {
    return this.http.put(`${this.playerUrl}/seek`, null, {
      params: {
        position_ms: `${positionMs}`
      }
    });
  }

  setVolume(volume: number) {
    return this.http.put(`${this.playerUrl}/volume`, null, {
      params: {
        volume_percent: `${volume}`
      }
    });
  }

  getRecentPlayedTracks(params: SpotifyApi.RecentlyPlayedParameterObject = { limit: SPOTIFY_DEFAULT_LIMIT }) {
    return this.http.get<SpotifyApiRecentPlayerTracksResponse>(
      `${this.playerUrl}/recently-played`,
      {
        params: params as any // eslint-disable-line
      }
    );
  }
}
