import {} from 'spotify-web-api-js';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
@Injectable({ providedIn: 'root' })
export class SpotifyApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  getMe() {
    return this.http.get<SpotifyApi.CurrentUsersProfileResponse>(`${this.appConfig.baseURL}/me`);
  }
}
