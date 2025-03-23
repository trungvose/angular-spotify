import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { SettingsFacade } from '@angular-spotify/web/settings/data-access';
import { PlaybackService } from '@angular-spotify/web/shared/data-access/store';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, throwError } from 'rxjs';
import { filter, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AppInit, AuthAccessTokenReady, AuthCodeReady } from './app-init.action';
import { GoogleAnalyticsService } from './google-analytics.service';
import { PromptUpdateService } from './promp-update.service';

@Injectable()
export class ApplicationEffects {
  constructor(
    private actions$: Actions,
    private authStore: AuthStore,
    private playbackService: PlaybackService,
    private settingsFacade: SettingsFacade,
    private router: Router,
    private googleAnalytics: GoogleAnalyticsService,
    private promptUpdate: PromptUpdateService
  ) {}


  initAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppInit),
        tap(() => {
          this.authStore.initAuthCode();
        })
      ),
    {
      dispatch: false
    }
  );

  initRetrieveAccessToken$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthCodeReady),
        withLatestFrom(combineLatest([this.authStore.authCode$, this.authStore.codeVerifier$])),
        switchMap(([_, [authCode, codeVerifier]]) => {
          if (!authCode || !codeVerifier) {
            console.error('[Angular Spotify] Missing authCode or codeVerifier');
            return throwError(() => new Error('Missing authCode or codeVerifier'));
          }
          return this.authStore.initAccessToken(authCode, codeVerifier);
        })
      ),
    { dispatch: false }
  );

  initPlaybackSDK$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthAccessTokenReady),
        withLatestFrom(combineLatest([this.authStore.token$, this.settingsFacade.volume$])),
        tap(([_, [token, volume]]) => {
          this.playbackService.initPlaybackSDK(token, volume);
        })
      ),
    {
      dispatch: false
    }
  );

  sendGoogleAnalyticPageView$ = createEffect(
    () =>
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        tap((event) => {
          this.googleAnalytics.sendPageView(event.urlAfterRedirects);
        })
      ),
    {
      dispatch: false
    }
  );

  initForceUpdate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppInit),
        switchMap(() => this.promptUpdate.forceUpdate())
      ),
    {
      dispatch: false
    }
  );
}
