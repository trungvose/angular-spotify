import SpotifyWebApi from 'spotify-web-api-js';

import { Injectable } from '@angular/core';
import { AuthService } from '@angular-spotify/web/shared/data-access/auth';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SpotifyApiService {
  public readonly api: SpotifyWebApi.SpotifyWebApiJs;

  constructor(private authService: AuthService) {
    this.api = new SpotifyWebApi();
    this.authService.token$
      .pipe(
        tap((accessToken) => {
          this.api.setAccessToken(accessToken);
        })
      )
      .subscribe();
  }
}
