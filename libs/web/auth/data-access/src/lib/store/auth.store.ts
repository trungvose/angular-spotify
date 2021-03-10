// MAGIC LINE - WITHOUT THIS WOULD CAUSE THE BUILD TO FAIL
/// <reference types="spotify-api" />

import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { filter } from 'rxjs/operators';
export interface AuthState extends SpotifyApi.CurrentUsersProfileResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  state: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  readonly token$ = this.select((s) => s.accessToken).pipe(filter((token) => !!token));
  readonly getUserId = () => this.get().id;

  constructor() {
    super(<AuthState>{});
  }

  readonly setCurrentUser = this.updater((state, user: SpotifyApi.CurrentUsersProfileResponse) => ({
    ...state,
    ...user
  }));
}