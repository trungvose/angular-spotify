// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { AuthAccessTokenReady, AuthCodeReady } from '@angular-spotify/web/shared/app-init';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMapTo, tap } from 'rxjs/operators';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

export interface AuthorizationResponse {
  authorizationCode: string | null;
  state: string | null;
}

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
    private route: ActivatedRoute,
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

  readonly initAuthCode = this.effect((params$) =>
    params$.pipe(switchMapTo(this.initAuthenticationCode()))
  );

  private initAuthenticationCode() {
    const storedSession = <string>sessionStorage.getItem('SESSION');

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      this.savePath();

      console.info('[Angular Spotify] Existing session, retrieving information');

      if (this.isTokenExpired(sessionData.expiresAt)) {
        console.info(
          '[Angular Spotify] Existing session has expired! Cleaning and authenticating again'
        );
        console.info('[Angular Spotify] Clearing session');
        this.clearSessionAndRedirectToAuthorize();
      }

      return this.route.fragment.pipe(
        map(() => sessionData),
        tap((sessionData) => {
          this.getUserInfo();
          console.log('Session Data', sessionData);
          this.patchState(sessionData);
          this.store.dispatch(AuthAccessTokenReady());
          console.info('[Angular Spotify] Current State', this.get());
          console.info('[Angular Spotify] Authenticated from session!');
          this.router.navigate(['/']);
        })
      );
    } else {
      console.log('No Auth Store Found');
    }

    const queryParams = new URLSearchParams(window.location.search);
    console.info('[Angular Spotify] Query Params Code', queryParams.get('code'));


    if (!queryParams.get('code')) {
      const currentUrl = window.location.href;
      console.log('Current URL with query parameters:', currentUrl);
      console.info('[Angular Spotify] Clearing session as there is no params');
      this.clearSessionAndRedirectToAuthorize();
      return this.route.fragment.pipe(
        tap(() => { console.log('[Angular Spotify] No code in url', this.get()); }),
      );
    }

    return this.route.fragment.pipe(
      tap((params) => console.log('[Angular Spotify] Raw Query Params', params)),
      map(() => new URLSearchParams(window.location.search)),
      map((params) => ({
        accessToken: null,
        tokenType: null,
        expiresIn: null,
        state: null,
        code: params.get('code'),
        codeVerifier: sessionStorage.getItem('CODE_VERIFIER'),
      })),
      tap((params) => {
        console.log('[Angular Spotify] Response from auth code', params);

        // Get the current state and merge with the new params
        const currentState = this.get();

        console.log("Before Updating state", currentState);
        console.log("Params from auth state", currentState);
        this.patchState(params);
        console.log("Updated state", this.get());

        console.log("Dispatching AuthCodeReady action");
        this.store.dispatch(AuthCodeReady());
        console.info('[Angular Spotify] Retrieved auth Code successfully!');
      })
    );
  }

  initAccessToken(
    code: string,
    codeVerifier: string
  ): Observable<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }> {

    if (!code) {
      console.error('[Angular Spotify] No authorization code found');
      return throwError(() => new Error('No authorization code found'));
    }

    return this.getAccessToken(code, codeVerifier).pipe(
      shareReplay(1),
      tap((authData) => {
        console.log('Authorization Data', authData);
        const sessionData = {
          expiresIn: authData.expires_in,
          expiresAt: Date.now() + authData.expires_in * 1000,
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token,
          scope: authData.scope
        };
        sessionStorage.setItem('SESSION', JSON.stringify(sessionData));
        this.patchState(sessionData);
        this.store.dispatch(AuthAccessTokenReady());
        this.getUserInfo();
        this.router.navigate(['/']);
      })
    );
  }

  async redirectToAuthorize() {
    const codeVerifier = this.spotifyAuthorize.generateCodeVerifier();
    const codeChallenge = await this.spotifyAuthorize.generateCodeChallenge(codeVerifier);
    console.log("Generated Code Verifier", codeVerifier);
    sessionStorage.setItem('CODE_VERIFIER', codeVerifier);
    window.location.href = this.spotifyAuthorize.createAuthorizeURL(codeChallenge);
  }

  private getAccessToken(
    authCode: string,
    codeVerifier: string
  ): Observable<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }> {
    if (!codeVerifier) {
      console.error('Error getting code verifier');
      return throwError(() => new Error('No authorization code verifier found'));
    }

    console.info('[Angular Spotify] Auth Code:', authCode);
    console.info('[Angular Spotify] Code Verifier:', codeVerifier);

    return this.spotifyAuthorize.getAccessToken(authCode, codeVerifier).pipe(
      catchError((err) => {
        console.error('Error retrieving access token:', err);
        return throwError(() => new Error('Failed to retrieve access token'));
      })
    );
  }

  private getUserInfo() {
    this.spotify.getMe().subscribe((user) => {
      console.info('Making call to retrieve user ');
      this.setCurrentUser(user);
    });
  }

  private clearSessionAndRedirectToAuthorize() {
    console.warn('[Angular Spotify] Clearing session and redirecting to authorize');
    sessionStorage.removeItem('CODE-VERIFIER');
    LocalStorageService.removeItem('PATH');
    this.setState(<AuthState>{});
    this.redirectToAuthorize();
  }

  private savePath() {
    console.log('Saving Path', window.location.pathname);
    LocalStorageService.setItem('PATH', window.location.pathname);
  }

  private isTokenExpired(expiresAt: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= expiresAt;
  }
}
