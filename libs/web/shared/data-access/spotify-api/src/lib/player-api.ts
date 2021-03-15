import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlayerApiService {
  playerUrl: string;
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {
    this.playerUrl = `${this.appConfig.baseURL}/me/player`;
  }

  transferUserPlayback(deviceId: string) {
    return this.http.put(this.playerUrl, {
      device_ids: [deviceId],
      play: true
    });
  }

  play(request: { context_uri?: string; uris?: string[]; offset?: any }) {
    return this.http.put(`${this.playerUrl}/play`, request);
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
}
