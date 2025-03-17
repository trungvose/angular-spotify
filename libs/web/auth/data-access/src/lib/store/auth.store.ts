// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { AuthReady } from '@angular-spotify/web/shared/app-init';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMapTo, tap } from 'rxjs/operators';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

export interface AuthorizationResponse {
  authorizationCode: string | null;
  state: string | null;
}

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
  expiresAt?: number;
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

  readonly init = this.effect((params$) => params$.pipe(switchMapTo(this.initAuth())));

  private initAuth() {

    this.savePath();

    const storedSession = <string>sessionStorage.getItem('SESSION');

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      this.savePath();
      console.info('[Angular Spotify] Existing session, retrieving information');

      if (this.isTokenExpired(sessionData.expiresAt)) {
        console.info(
          '[Angular Spotify] Existing session has expired! Cleaning and authenticating again'
        );
        this.clearSessionAndRedirectToAuthorize();
      }

      return this.route.fragment.pipe(
        map(() => sessionData),
        tap((sessionData) => {
          this.getUserInfo();
          console.log("Session Data", sessionData)
          this.patchState(sessionData);
          this.store.dispatch(AuthReady());
          console.info('[Angular Spotify] Authenticated!');
        })
      );
    }

    const queryParams = this.route.snapshot.queryParams;

    if (!queryParams['code'] || !queryParams['state']) {
      const currentUrl = window.location.href;
      console.log("Current URL with query parameters:", currentUrl);
      this.redirectToAuthorize();
    }

    console.info('[Angular Spotify] Creating new session');

    return this.route.queryParamMap.pipe(
      tap((params) => console.log("[Angular Spotify] Raw Query Params", params)),// Filter out empty query params
      map((params) => ({
        authorizationCode: new URLSearchParams(window.location.search).get('code'),
      })),
      tap((authResponse) => {
        console.log("[Angular Spotify] Query params!", authResponse);
        const authorizationCode = authResponse.authorizationCode ?? 'No authorization code';

        this.getAccessToken(authorizationCode);

        const storedSession = <string>sessionStorage.getItem('SESSION');
        const authenticationData = JSON.parse(storedSession);


        this.patchState(authenticationData);
        this.store.dispatch(AuthReady());

        console.log("[Angular Spotify] Auth Finished!", authResponse);

        this.router.navigate([LocalStorageService.initialState?.path || '/']);
      })
    );
  }

  async redirectToAuthorize() {
    const codeVerifier = this.spotifyAuthorize.generateCodeVerifier();
    const codeChallenge = await this.spotifyAuthorize.generateCodeChallenge(codeVerifier);
    sessionStorage.clear();
    sessionStorage.setItem('CODE-VERIFIER', codeVerifier);
    window.location.href = this.spotifyAuthorize.createAuthorizeURL(codeChallenge);
  }

  private getAccessToken(authCode: string): void {
    console.info('[Angular Spotify] Retrieving Generated Code Verifier');

    const codeVerifier = sessionStorage.getItem('CODE-VERIFIER');
    if (!codeVerifier) {
      console.log('Error getting code verifier');
      this.clearSessionAndRedirectToAuthorize();
      return;
    }

    console.info('[Angular Spotify] Auth Code value', authCode);
    console.info('[Angular Spotify] Code Verifier value', codeVerifier);

    this.spotifyAuthorize.getAccessToken(authCode, codeVerifier).pipe(
      tap((authData) => {
        console.info('[Angular Spotify] Retrieved Token Info', JSON.stringify(authData));

        const sessionData = {
          expiresIn: authData.expires_in,
          expiresAt: Date.now() + authData.expires_in * 1000,
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token,
          scope: authData.scope,
        };

        console.info('[Angular Spotify] Storing Token Info', JSON.stringify(sessionData));
        sessionStorage.setItem('SESSION', JSON.stringify(sessionData));
        console.info('[Angular Spotify] Token Info Stored Successfully', JSON.stringify(sessionData));
      }),
    ).subscribe(
      () => {
        console.log('[Angular Spotify] Access Token retrieved and session stored.');
      },
      (err) => {
        console.error(err);
        this.clearSessionAndRedirectToAuthorize();
      }
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
    sessionStorage.removeItem('SESSION');
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
