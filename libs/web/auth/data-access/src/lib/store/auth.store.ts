// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { AuthSessionReady, AuthCodeReady } from '@angular-spotify/web/shared/app-init';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, switchMapTo, take, tap } from 'rxjs/operators';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  codeVerifier: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  state: string | null;
  expiresAt?: number | null;
  code: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  constructor(
    private router: Router,
    private store: Store,
    private spotifyAuthorize: SpotifyAuthorize,
    private spotify: SpotifyApiService
  ) {
    super(<AuthState>{});
  }

  readonly token$ = this.select((s) => s.accessToken).pipe(
    filter((token) => !!token)
  ) as Observable<string>;

  readonly authCode$ = this.select((s) => s.code).pipe(
    filter((code) => !!code)
  ) as Observable<string>;

  readonly codeVerifier$ = this.select((s) => s.codeVerifier).pipe(
    filter((codeVerifier) => !!codeVerifier)
  ) as Observable<string>;

  readonly country$ = this.select((s) => s.country);
  readonly userName$ = this.select((s) => s.display_name);
  readonly userProduct$ = this.select((s) => s.product);
  readonly userAvatar$ = this.select(
    (s) =>
      (s.images && s.images[0]?.url) ||
      'https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0='
  );
  readonly setCurrentUser = this.updater((state, user: SpotifyApi.CurrentUsersProfileResponse) => ({
    ...state,
    ...user
  }));

  readonly initAuthentication = this.effect((params$) =>
    params$.pipe(switchMapTo(this.initAuthenticationFlow()))
  );

  private initAuthenticationFlow() {
    console.log('Starting Authentication Flow');
    const storedSession = <string>sessionStorage.getItem('SESSION');
    if (storedSession) {
      return this.handleExistingSession(storedSession);
    }
    return this.handleNewAuthenticationFlow();
  }

  private handleExistingSession(storedSession: string) {
    const sessionData = JSON.parse(storedSession);
    console.info('[Angular Spotify] Existing session, retrieving information');
    if (this.isTokenExpired(sessionData.expiresAt)) {
      console.info(
        '[Angular Spotify] Existing session has expired! Cleaning and authenticating again'
      );
      this.clearSessionAndRedirectToAuthorize();
      return of(); // Immediately clear session and exit
    }
    return of(sessionData).pipe(
      tap((sessionData) => {
        this.patchState(sessionData);
        this.store.dispatch(AuthSessionReady());
        console.info('[Angular Spotify] Authenticated from Existing Session!');
        this.setCurrentUser(this.spotify.getMe());
      })
    );
  }

  private handleNewAuthenticationFlow() {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    if (!code) {
      LocalStorageService.setItem('PATH', window.location.pathname);
      this.clearSessionAndRedirectToAuthorize();
      return of().pipe(
        tap(() => {
          console.log('[Angular Spotify] No code in URL, redirecting to authorize');
        })
      );
    }
    return of(window.location.search).pipe(
      take(1),
      map((searchParams) => new URLSearchParams(searchParams)),
      map((params) => ({
        code: params.get('code'),
        codeVerifier: sessionStorage.getItem('CODE_VERIFIER')
      })),
      tap((params) => {
        this.patchState(params);
        this.store.dispatch(AuthCodeReady());
        console.log('[Angular Spotify] Authentication Code successfully retrieved');
      })
    );
  }

  initRetrieveAccessToken(
    authCode: string,
    codeVerifier: string
  ) {
    return this.spotifyAuthorize.getAccessToken(authCode, codeVerifier).pipe(
      map((getAccessTokenResponse) => {
        return {
          accessToken: getAccessTokenResponse.access_token,
          expiresIn: getAccessTokenResponse.expires_in,
          expiresAt: Date.now() + getAccessTokenResponse.expires_in * 1000,
          refreshToken: getAccessTokenResponse.refresh_token,
          scope: getAccessTokenResponse.scope
        };
      }),
      tap((accessTokenResponse) => {
        sessionStorage.setItem('SESSION', JSON.stringify(accessTokenResponse));
        sessionStorage.removeItem('CODE_VERIFIER'); // Remove after use
        this.patchState(accessTokenResponse);
        this.store.dispatch(AuthSessionReady());
        console.info('[Angular Spotify] Authenticated from New Session!');
        this.setCurrentUser(this.spotify.getMe());
        this.router.navigate([LocalStorageService.initialState?.path || '/']);
      })
    );
  }

  private clearSessionAndRedirectToAuthorize() {
    console.warn('[Angular Spotify] Clearing session and redirecting to authorize');
    sessionStorage.removeItem('SESSION');
    sessionStorage.removeItem('CODE-VERIFIER');
    this.setState(<AuthState>{});
    this.redirectToAuthorize();
  }

  async redirectToAuthorize() {
    const codeVerifier = this.spotifyAuthorize.generateCodeVerifier();
    const codeChallenge = await this.spotifyAuthorize.generateCodeChallenge(codeVerifier);
    sessionStorage.setItem('CODE_VERIFIER', codeVerifier);
    window.location.href = this.spotifyAuthorize.createAuthorizeURL(codeChallenge);
  }

  private isTokenExpired(expiresAt: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= expiresAt;
  }
}
