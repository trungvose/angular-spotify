import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArtistApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  getArtist(artistId: string) {
    return this.http.get<SpotifyApi.ArtistObjectFull>(
      `${this.appConfig.baseURL}/artists/${artistId}`
    );
  }

  getArtistTopTracks(artistId: string, country: string) {
    return this.http.get<SpotifyApi.ArtistsTopTracksResponse>(
      `${this.appConfig.baseURL}/artists/${artistId}/top-tracks?market=${country}`
    );
  }
}
