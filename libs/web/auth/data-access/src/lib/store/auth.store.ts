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

const LOCALSTORAGE_KEYS = {
  CODE_VERIFIER: 'code_verifier',
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
  PATH: 'path'
} as const;

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  expiresAt: number | null;
  expiresIn: number;
  state: string | null;
  tokenType: string | null;
}

export interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
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
      LocalStorageService.setItem(LOCALSTORAGE_KEYS.CODE_VERIFIER, codeVerifier);
      window.location.href = url.toString();
    });
  }

  // https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
  private initAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      return this.handleFirstLogin(code, state);
    }

    return this.handleExistingTokens();
  }

  private handleFirstLogin(code: string, state: string | null): Observable<SpotifyApi.CurrentUsersProfileResponse> {
    return this.exchangeCodeForToken(code).pipe(
      tap((tokenResponse) => {
        const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
        this.saveTokensToStorage(tokenResponse, expiresAt);
        this.updateStateWithTokens(tokenResponse, expiresAt, state);
        this.dispatchAuthReady();
      }),
      switchMap(() => this.loadUserProfile(true))
    );
  }

  private handleExistingTokens(): Observable<SpotifyApi.CurrentUsersProfileResponse | never> {
    const accessToken = LocalStorageService.getItem(LOCALSTORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = LocalStorageService.getItem(LOCALSTORAGE_KEYS.EXPIRES_AT);
    const refreshToken = LocalStorageService.getItem(LOCALSTORAGE_KEYS.REFRESH_TOKEN);

    if (!accessToken || !refreshToken) {
      this.redirectToAuthorizeIfNeeded();
      return EMPTY;
    }

    if (this.isTokenExpired(expiresAt)) {
      return this.handleTokenRefresh(refreshToken);
    }

    return this.handleValidToken(accessToken, expiresAt);
  }

  private handleTokenRefresh(refreshToken: string): Observable<SpotifyApi.CurrentUsersProfileResponse> {
    return this.refreshAccessToken(refreshToken).pipe(
      tap((tokenResponse) => {
        const newExpiresAt = Date.now() + tokenResponse.expires_in * 1000;
        this.saveTokensToStorage(tokenResponse, newExpiresAt);
        this.updateStateWithTokens(tokenResponse, newExpiresAt);
        this.dispatchAuthReady();
      }),
      switchMap(() => this.loadUserProfile(false))
    );
  }

  private handleValidToken(accessToken: string, expiresAt: number): Observable<SpotifyApi.CurrentUsersProfileResponse> {
    const tokenType = LocalStorageService.getItem(LOCALSTORAGE_KEYS.TOKEN_TYPE) || 'Bearer';
    this.patchState({
      accessToken: accessToken,
      tokenType: tokenType,
      expiresAt: expiresAt
    });
    this.dispatchAuthReady();
    return this.loadUserProfile(false);
  }

  private saveTokensToStorage(tokenResponse: SpotifyTokenResponse, expiresAt: number): void {
    LocalStorageService.setItem(LOCALSTORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
    LocalStorageService.setItem(LOCALSTORAGE_KEYS.TOKEN_TYPE, tokenResponse.token_type);
    LocalStorageService.setItem(LOCALSTORAGE_KEYS.EXPIRES_AT, expiresAt);

    if (tokenResponse.refresh_token) {
      LocalStorageService.setItem(LOCALSTORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
    }
  }

  private updateStateWithTokens(
    tokenResponse: SpotifyTokenResponse,
    expiresAt: number,
    state?: string | null
  ): void {
    this.patchState({
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      expiresIn: tokenResponse.expires_in,
      expiresAt: expiresAt,
      ...(state && { state })
    });
  }

  private loadUserProfile(shouldNavigate: boolean): Observable<SpotifyApi.CurrentUsersProfileResponse> {
    return this.spotify.getMe().pipe(
      tap((user) => {
        this.setCurrentUser(user);
        if (shouldNavigate) {
          this.router.navigate([LocalStorageService.initialState?.path || '/'], {
            replaceUrl: true
          });
        }
      })
    );
  }

  private isTokenExpired(expiresAt: number | null): boolean {
    return !expiresAt || Date.now() >= expiresAt;
  }

  private redirectToAuthorizeIfNeeded(): void {
    LocalStorageService.setItem(LOCALSTORAGE_KEYS.PATH, window.location.pathname);
    this.redirectToAuthorize();
  }

  /**
   * Dispatches AuthReady action asynchronously to ensure effects are subscribed.
   * This is necessary because AuthReady may be dispatched during the execution
   * of initAuth$ effect, before initPlaybackSDK$ effect is subscribed.
   */
  private dispatchAuthReady(): void {
    setTimeout(() => {
      this.store.dispatch(AuthReady());
    }, 0);
  }

  private exchangeCodeForToken(code: string): Observable<SpotifyTokenResponse> {
    const codeVerifier = LocalStorageService.getItem(LOCALSTORAGE_KEYS.CODE_VERIFIER);
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
          ...HEADERS
        }
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  private refreshAccessToken(refreshToken: string): Observable<SpotifyTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.spotifyAuthorize.CLIENT_ID
    });

    return this.http
      .post<SpotifyTokenResponse>(this.spotifyAuthorize.TOKEN_URL, body.toString(), {
        headers: {
          ...HEADERS
        }
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
