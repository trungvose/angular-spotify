// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { filter, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { SpotifyAuthorize } from '../models/spotify-authorize';
import { FeatureStore } from 'mini-rx-store';
export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore extends FeatureStore<AuthState> {
  readonly token$ = this.select((s) => s.accessToken).pipe(
    filter((token) => !!token)
  ) as Observable<string>;
  readonly country$ = this.select((s) => s.country);
  readonly userName$ = this.select((s) => s.display_name);
  readonly userAvatar$ = this.select(
    (s) =>
      (s.images && s.images[0]?.url) || 'https://avatars.githubusercontent.com/u/66833983?s=200&v=4'
  );
  readonly getUserId = () => this.state.id;
  readonly getToken = () => this.state.accessToken;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spotify: SpotifyApiService,
    private modalService: NzModalService
  ) {
    super('auth', <AuthState>{});
  }

  private setCurrentUser(user: SpotifyApi.CurrentUsersProfileResponse) {
    console.log(user);
    this.setState(state => ({
      ...state,
      ...user
    }));
  };

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
      map((fragment) => new URLSearchParams(fragment)),
      map((params) => ({
        accessToken: params.get('access_token'),
        tokenType: params.get('token_type'),
        expiresIn: Number(params.get('expires_in')),
        state: params.get('state')
      })),
      tap((params) => {
        this.setState(params);
        console.info('[Angular Spotify] Authenticated!');
      }),
      switchMap(() => this.spotify.getMe()),
      tap((me) => {
        this.setCurrentUser(me);
        this.router.navigate([]);
      })
    );
  }
}
