import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '@angular-spotify/web/shared/app-config';

@Injectable({ providedIn: 'root' })
export class BrowseApiService {
  browseUrl: string;
  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig, private http: HttpClient) {
    this.browseUrl = `${this.appConfig.baseURL}/browse`;
  }

  getAllFeaturedPlaylists(
    params: Record<string, any> = {// eslint-disable-line
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
}
