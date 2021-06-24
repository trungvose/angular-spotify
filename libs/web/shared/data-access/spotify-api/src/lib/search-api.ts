import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { SpotifyApiParams } from '@angular-spotify/web/shared/data-access/models';

export type SearchResponse = Pick<
  SpotifyApi.SearchResponse,
  'tracks' | 'artists' | 'albums' | 'playlists'
>;

@Injectable({ providedIn: 'root' })
export class SearchApiService {
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {}

  /**
   * Search for tracks, artists, albums, and playlists
   *
   * @param {string} term
   * @param {SpotifyApiParams} [apiParams={ limit: 50 }]
   * @return {*}  {(Observable<SearchResponse>)}
   */
  search(term: string, apiParams: SpotifyApiParams = { limit: 50 }): Observable<SearchResponse> {
    const params = new HttpParams({ fromObject: apiParams })
      .set('q', term)
      .set('type', 'track,artist,album,playlist');

    return this.http.get<SpotifyApi.SearchResponse>(`${this.appConfig.baseURL}/search`, { params });
  }
}
