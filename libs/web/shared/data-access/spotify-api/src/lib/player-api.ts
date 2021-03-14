import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlayerApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  transferUserPlayback(deviceId: string) {
    return this.http.put(`${this.appConfig.baseURL}/me/player`, {
      device_ids: [deviceId],
      play: true
    });
  }

  play(request: { context_uri?: string; uris?: string[]; offset?: any }) {
    return this.http.put(`${this.appConfig.baseURL}/me/player/play`, request);
  }
}
