// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { AuthReady } from '@angular-spotify/web/shared/app-init';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMapTo, tap } from 'rxjs/operators';
import { SpotifyAuthorize } from '../models/spotify-authorize';

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spotify: SpotifyApiService,
    private store: Store,  
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
  readonly getUserId = () => this.get().id;
  readonly getToken = () => this.get().accessToken;  

  readonly setCurrentUser = this.updater((state, user: SpotifyApi.CurrentUsersProfileResponse) => {
    console.log(user);
    return {
      ...state,
      ...user
    };
  });

  readonly init = this.effect((params$) => params$.pipe(switchMapTo(this.initAuth())));

  redirectToAuthorize() {
    const spotifyAuthorize = new SpotifyAuthorize();
    const url = spotifyAuthorize.createAuthorizeURL();
    window.location.href = url;
  }

  private initAuth() {
    if (!window.location.hash) {
      this.redirectToAuthorize();
    }

    return this.route.fragment.pipe(
      filter((fragment) => !!fragment),
      map((fragment) => new URLSearchParams(fragment as string)),
      map((params) => ({
        accessToken: params.get('access_token'),
        tokenType: params.get('token_type'),
        expiresIn: Number(params.get('expires_in')),
        state: params.get('state')
      })),
      tap((params) => {
        this.patchState(params);
        this.store.dispatch(AuthReady());
        console.info('[Angular Spotify] Authenticated!');
      }),
      tap(() => {
        this.setCurrentUser(this.spotify.getMe());
        this.router.navigate([]);
      })
    );
  }
}
