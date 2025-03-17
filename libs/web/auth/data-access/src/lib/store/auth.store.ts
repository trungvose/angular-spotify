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
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';

export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
  expiresAt?: number;
}

enum SessionState {
  NewSession,
  ExistingSession,
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
      (s.images && s.images[0]?.url) ||
      'https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0='
  );
  readonly setCurrentUser = this.updater((state, user: SpotifyApi.CurrentUsersProfileResponse) => ({
    ...state,
    ...user
  }));

  readonly init = this.effect((params$) => params$.pipe(switchMapTo(this.initAuth())));

  redirectToAuthorize() {
    const spotifyAuthorize = new SpotifyAuthorize();
    window.location.href = spotifyAuthorize.createAuthorizeURL();
  }

  private initAuth() {
    const storedSession = <string>sessionStorage.getItem('SESSION');

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      this.savePath();
      console.info('[Angular Spotify] Existing session, retrieving information');

      if (this.isTokenExpired(sessionData.expiresAt)) {
        console.info('[Angular Spotify] Existing session has expired! Cleaning and authenticating again');
        this.clearSessionAndRedirectToAuthorize();
      }

      return this.route.fragment.pipe(
        map(() => sessionData),
        tap(this.handleAuthentication(SessionState.ExistingSession))
      );
    }

    if (!window.location.hash) {
      this.savePath();
      this.redirectToAuthorize();
    }

    return this.route.fragment.pipe(
      filter((fragment) => !!fragment),
      map((fragment) => new URLSearchParams(fragment as string)),
      map(this.mapAuthenticationResponse()),
      tap(this.handleAuthentication(SessionState.NewSession))
    );
  }

  private handleAuthentication(sessionState: SessionState) {
    return (
      authenticationData:
        | Partial<AuthState>
        | Observable<Partial<AuthState>>
        | ((state: AuthState) => Partial<AuthState>)
    ) => {
      this.patchState(authenticationData);
      this.store.dispatch(AuthReady());
      sessionStorage.setItem('SESSION', JSON.stringify(authenticationData));
      console.info('[Angular Spotify] Authenticated!');
      this.getUserInfo();
      if (sessionState === SessionState.NewSession) {
        this.router.navigate([LocalStorageService.initialState?.path || '/']);
      }
    };
  }

  private mapAuthenticationResponse() {
    return (params: URLSearchParams) => ({
      accessToken: params.get('access_token'),
      tokenType: params.get('token_type'),
      expiresIn: Number(params.get('expires_in')),
      state: params.get('state'),
      expiresAt: Math.floor(Date.now() / 1000) + Number(params.get('expires_in'))
    });
  }

  private getUserInfo() {
    this.spotify.getMe().subscribe((user) => {
      this.setCurrentUser(user);
    });
  }

  private clearSessionAndRedirectToAuthorize() {
    console.warn('[Angular Spotify] Clearing session and redirecting to authorize');
    sessionStorage.removeItem('SESSION');
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
