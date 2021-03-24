// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  readonly token$ = this.select((s) => s.accessToken).pipe(
    filter((token) => !!token)
  ) as Observable<string>;
  readonly country$ = this.select((s) => s.country);
  readonly getUserId = () => this.get().id;
  readonly getToken = () => this.get().accessToken;

  constructor() {
    super(<AuthState>{});
  }

  readonly setCurrentUser = this.updater((state, user: SpotifyApi.CurrentUsersProfileResponse) => {
    console.log(user);
    return ({
      ...state,
      ...user
    })
  });
}
