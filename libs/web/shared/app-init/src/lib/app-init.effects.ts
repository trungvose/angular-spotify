import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { SettingsFacade } from '@angular-spotify/web/settings/data-access';
import { PlaybackService } from '@angular-spotify/web/shared/data-access/store';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';
import { AppInit, AuthReady } from './app-init.action';

@Injectable()
export class ApplicationEffects {
  constructor(
    private actions$: Actions,
    private authStore: AuthStore,
    private playbackService: PlaybackService,
    private settingsFacade: SettingsFacade
  ) {}

  initAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppInit),
        tap(() => {
          this.authStore.init();
        })
      ),
    {
      dispatch: false
    }
  );

  initPlaybackSDK$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthReady),
        withLatestFrom(combineLatest([this.authStore.token$, this.settingsFacade.volume$])),
        tap(([_, [token, volume]]) => {
          this.playbackService.initPlaybackSDK(token, volume);
        })
      ),
    {
      dispatch: false
    }
  );
}
