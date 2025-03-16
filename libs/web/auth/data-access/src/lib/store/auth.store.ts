// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { AuthReady } from '@angular-spotify/web/shared/app-init';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, switchMapTo, tap } from 'rxjs/operators';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
  expiresAt?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spotify: SpotifyApiService,
    private store: Store
  ) {
    super(<AuthState>{});
  }

  readonly token$ = this.select((s) => s.accessToken).pipe(
    filter((token) => !!token)
  ) as Observable<string>;
  readonly country$ = this.select((s) => s.country);
  readonly userName$ = this.select((s) => s.display_name);
  readonly userProduct$ = this.select((s) => s.product);
  readonly userAvatar$ = this.select(
    (s) =>
      (s.images && s.images[0]?.url) || 'https://avatars.githubusercontent.com/u/66833983?s=200&v=4'
  );
  readonly setCurrentUser = this.updater((state, user: SpotifyApi.CurrentUsersProfileResponse) => ({
    ...state,
    ...user
  }));

  readonly init = this.effect((params$) => params$.pipe(switchMapTo(this.initAuth())));

  private initAuth() {
    const storedSession = sessionStorage.getItem('SESSION');

    if (storedSession) {
      LocalStorageService.setItem('PATH', window.location.pathname);
      console.debug("[Angular Spotify] Existing session, retrieving information");
      return this.route.fragment.pipe(
        map(() =>  JSON.parse(<string>sessionStorage.getItem('SESSION'))),
        tap((sessionData) => {

          this.patchState(sessionData);
          this.store.dispatch(AuthReady());
          console.info('[Angular Spotify] Authenticated from Session!');

          // Get user info
          this.spotify.getMe().subscribe((user) => {
            this.setCurrentUser(user);
          });
        })
      );
    }

    if (!window.location.hash) {
      console.info('Authorize has not been found, redirecting to authorize');
      LocalStorageService.setItem('PATH', window.location.pathname);
      this.redirectToAuthorize();
      return of(void 0);
    }

    return this.route.fragment.pipe(
      filter((fragment) => !!fragment),
      map((fragment) => new URLSearchParams(fragment as string)),
      map((params) => ({
        accessToken: params.get('access_token'),
        tokenType: params.get('token_type'),
        expiresIn: Number(params.get('expires_in')),
        state: params.get('state'),
        expiresAt: Number(params.get('expires_in'))
      })),
      tap((params) => {
        this.patchState(params);
        this.store.dispatch(AuthReady());
        console.info('[Angular Spotify] Authenticated!');

        sessionStorage.setItem('SESSION', JSON.stringify(params));

        // Get user info
        this.spotify.getMe().subscribe((user) => {
          this.setCurrentUser(user);
        });

        this.router.navigate([LocalStorageService.initialState?.path || '/']);
      })
    );
  }


  redirectToAuthorize() {
    const spotifyAuthorize = new SpotifyAuthorize();
    window.location.href = spotifyAuthorize.createAuthorizeURL();
  }
}
