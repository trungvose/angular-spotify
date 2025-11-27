// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { AuthReady } from '@angular-spotify/web/shared/app-init';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
}

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  constructor(
    private router: Router,
    private spotify: SpotifyApiService,
    private store: Store,
    private http: HttpClient
  ) {
    super(<AuthState>{});
  }
  spotifyAuthorize = new SpotifyAuthorize();
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
    return {
      ...state,
      ...user
    };
  });

  readonly init = this.effect((params$) => params$.pipe(switchMapTo(this.initAuth())));

  redirectToAuthorize() {
    this.spotifyAuthorize.createAuthorizeURL().then(({ url, codeVerifier }) => {
      LocalStorageService.setItem('code_verifier', codeVerifier);
      window.location.href = url.toString();
    });
  }

  private initAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code) {
      LocalStorageService.setItem('PATH', window.location.pathname);
      this.redirectToAuthorize();
      return EMPTY;
    }

    return this.exchangeCodeForToken(code).pipe(
      tap((tokenResponse) => {
        this.patchState({
          accessToken: tokenResponse.access_token,
          tokenType: tokenResponse.token_type,
          expiresIn: tokenResponse.expires_in,
          state: state
        });
        LocalStorageService.setItem('access_token', tokenResponse.access_token);
        LocalStorageService.setItem('token_type', tokenResponse.token_type);
        this.store.dispatch(AuthReady());
      }),
      switchMap(() => this.spotify.getMe()),
      tap((user) => {
        this.setCurrentUser(user);
        this.router.navigate([LocalStorageService.initialState?.path || '/'], {
          replaceUrl: true
        });
      })
    );
  }

  private exchangeCodeForToken(code: string): Observable<SpotifyTokenResponse> {
    const codeVerifier = LocalStorageService.getItem('code_verifier');
    if (!codeVerifier) {
      return throwError(() => new Error('Code verifier not found in localStorage'));
    }

    const redirectUri = `${window.location.origin}/`;
    const body = new URLSearchParams({
      client_id: this.spotifyAuthorize.CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });

    return this.http
      .post<SpotifyTokenResponse>(this.spotifyAuthorize.TOKEN_URL, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
