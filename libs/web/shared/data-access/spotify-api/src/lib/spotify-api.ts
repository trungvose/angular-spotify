import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class SpotifyApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  getMe(): Observable<SpotifyApi.CurrentUsersProfileResponse> {
    return this.http.get<SpotifyApi.CurrentUsersProfileResponse>(`${this.appConfig.baseURL}/me`);
  }
}
