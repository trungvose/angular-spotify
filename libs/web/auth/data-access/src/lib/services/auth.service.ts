import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { AuthStore } from '../store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private spotify: SpotifyApiService
  ) {}

  init() {
    if (!window.location.hash) {
      this.redirectToAuthorize();
    }

    this.route.fragment
      .pipe(
        filter((fragment) => !!fragment),
        map((fragment) => new URLSearchParams(fragment)),
        map((params) => ({
          accessToken: params.get('access_token'),
          tokenType: params.get('token_type'),
          expiresIn: Number(params.get('expires_in')),
          state: params.get('state')
        })),
        tap((params) => {
          this.authStore.patchState(params);
          console.info('spotify authenticated');
        }),
        tap(() => {
          this.authStore.setCurrentUser(this.spotify.getMe());
          this.router.navigate([]);
        })
      )
      .subscribe();
  }

  redirectToAuthorize() {
    const spotifyAuthorize = new SpotifyAuthorize();
    const url = spotifyAuthorize.createAuthorizeURL();
    window.location.href = url;
  }
}
