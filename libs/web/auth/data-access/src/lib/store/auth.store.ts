// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, switchMapTo, take, tap } from 'rxjs/operators';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';
import { AccessTokenResponse, SpotifyAuthorize } from '../models/spotify-authorize';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { CookieService } from 'ngx-cookie-service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  AuthCodeReady,
  AuthExistingSession,
  AuthSessionReady
} from '@angular-spotify/web/shared/app-init';

const CODE_VERIFIER_COOKIE_NAME = 'CODE_VERIFIER';
const SESSION_COOKIE_NAME = 'SESSION';

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
    private spotify: SpotifyApiService,
    private cookieService: CookieService
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

  readonly refreshToken$ = this.select((s) => s.refreshToken).pipe(
    filter((refreshToken) => !!refreshToken)
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
    const storedSession = this.cookieService.get(SESSION_COOKIE_NAME);
    if (storedSession) {
      return this.handleExistingSession(storedSession);
    }
    return this.handleNewAuthenticationFlow();
  }

  private handleExistingSession(storedSession: string) {
    const sessionData = JSON.parse(storedSession);
    return of(sessionData).pipe(
      tap((sessionData) => {
        console.info('[Angular Spotify] Existing session, retrieving information');
        this.patchState(sessionData);

        if (this.isTokenExpired(sessionData.expiresAt)) {
          LocalStorageService.setItem('PATH', window.location.pathname);
          console.info(
            '[Angular Spotify] Existing session has expired! Cleaning and authenticating again'
          );
          this.store.dispatch(AuthExistingSession());
          return; // Trying to refresh existing token
        }

        this.store.dispatch(AuthSessionReady());
        console.info('[Angular Spotify] Authenticated from Existing Session!');
        this.setCurrentUser(this.spotify.getMe());
      })
    );
  }

  private handleNewAuthenticationFlow() {
    console.log('[Angular Spotify] Handle new auth flow');
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
        codeVerifier: sessionStorage.getItem(CODE_VERIFIER_COOKIE_NAME)
      })),
      tap((params) => {
        if (!params.code || !params.codeVerifier) {
          this.clearSessionAndRedirectToAuthorize();
          return;
        }

        this.patchState(params);
        this.store.dispatch(AuthCodeReady());
        console.log('[Angular Spotify] Authentication Code successfully retrieved!');
      })
    );
  }

  initRetrieveAccessToken(authCode: string, codeVerifier: string) {
    return this.spotifyAuthorize
      .getAccessToken(authCode, codeVerifier)
      .pipe(map(this.mapAccessTokenResponse()), tap(this.handleAccessTokenResponse()));
  }

  initRetrieveRefreshToken(refreshToken: string) {
    return this.spotifyAuthorize
      .getRefreshToken(refreshToken)
      .pipe(map(this.mapAccessTokenResponse()), tap(this.handleAccessTokenResponse()));
  }

  private mapAccessTokenResponse() {
    return (getAccessTokenResponse: any) => {
      return {
        accessToken: getAccessTokenResponse.access_token,
        expiresIn: getAccessTokenResponse.expires_in,
        expiresAt: Date.now() + getAccessTokenResponse.expires_in * 1000,
        refreshToken: getAccessTokenResponse.refresh_token,
        scope: getAccessTokenResponse.scope
      };
    };
  }

  private handleAccessTokenResponse(): (accessTokenResponse: AccessTokenResponse) => void {
    return (accessTokenResponse: AccessTokenResponse) => {
      this.cookieService.set(SESSION_COOKIE_NAME, JSON.stringify(accessTokenResponse), {
        secure: true,
        sameSite: 'Strict',
        expires: 30 // set expiration to 1 day or any other time suitable
      });
      sessionStorage.removeItem(CODE_VERIFIER_COOKIE_NAME); // Remove after use
      this.patchState(accessTokenResponse);
      this.store.dispatch(AuthSessionReady());
      console.info('[Angular Spotify] Authenticated from New Session!');
      this.setCurrentUser(this.spotify.getMe());
      this.router.navigate([LocalStorageService.initialState?.path || '/']);
    };
  }

  private clearSessionAndRedirectToAuthorize() {
    console.warn('[Angular Spotify] Clearing session and redirecting to authorize');
    this.cookieService.delete(SESSION_COOKIE_NAME);
    this.cookieService.delete(CODE_VERIFIER_COOKIE_NAME);
    this.setState(<AuthState>{});
    this.redirectToAuthorize();
  }

  async redirectToAuthorize() {
    const codeVerifier = this.spotifyAuthorize.generateCodeVerifier();
    const codeChallenge = await this.spotifyAuthorize.generateCodeChallenge(codeVerifier);
    sessionStorage.setItem(CODE_VERIFIER_COOKIE_NAME, codeVerifier);
    window.location.href = this.spotifyAuthorize.createAuthorizeURL(codeChallenge);
  }

  private isTokenExpired(expiresAt: number): boolean {
    if (!expiresAt || isNaN(expiresAt)) {
      throw new Error('Invalid expiration timestamp');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp > expiresAt;
  }
}
