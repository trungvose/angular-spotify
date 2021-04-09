import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { map } from 'rxjs/operators';
import { SpotifyApiParams } from '@angular-spotify/web/shared/data-access/models';
@Injectable({ providedIn: 'root' })
export class BrowseApiService {
  browseUrl: string;
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {
    this.browseUrl = `${this.appConfig.baseURL}/browse`;
  }

  getAllFeaturedPlaylists(
    params: SpotifyApiParams = {
      limit: 50
    }
  ) {
    return this.http.get<SpotifyApi.ListOfFeaturedPlaylistsResponse>(
      `${this.browseUrl}/featured-playlists`,
      {
        params
      }
    );
  }

  getAllCategories(
    params: SpotifyApiParams = {
      limit: 50
    }
  ) {
    return this.http
      .get<SpotifyApi.MultipleCategoriesResponse>(`${this.browseUrl}/categories`, {
        params
      })
      .pipe(map((res) => res.categories));
  }

  getCategoryPlaylists(
    categoryId: string,
    params: SpotifyApiParams = {
      limit: 50
    }
  ) {
    return this.http
      .get<SpotifyApi.CategoryPlaylistsReponse>(
        `${this.browseUrl}/categories/${categoryId}/playlists`,
        {
          params
        }
      )
      .pipe(map((res) => res.playlists));
  }
}
