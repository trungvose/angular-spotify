import {} from 'spotify-web-api-js';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SpotifyApiService {
  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<SpotifyApi.CurrentUsersProfileResponse>('/me');
  }
}
