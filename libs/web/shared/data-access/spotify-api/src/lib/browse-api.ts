import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { map } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class BrowseApiService {
  browseUrl: string;
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {
    this.browseUrl = `${this.appConfig.baseURL}/browse`;
  }

  getAllFeaturedPlaylists(
    params: Record<string, any> = {
      // eslint-disable-line
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
    params: Record<string, any> = {
      // eslint-disable-line
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
    params: Record<string, any> = {
      // eslint-disable-line
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
