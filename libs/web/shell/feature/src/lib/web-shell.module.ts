import { SettingsModule } from '@angular-spotify/web/settings/feature';
import { AppInit, ApplicationEffects } from '@angular-spotify/web/shared/app-init';
import { IconModule } from '@angular-spotify/web/shared/ui/icon';
import { WebLayoutModule } from '@angular-spotify/web/shell/ui/layout';
import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router, RouterModule, withViewTransitions } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import * as Sentry from '@sentry/angular';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { webShellRoutes } from './web-shell.routes';

/** config angular i18n **/
import {
  PlaylistsEffect,
  playlistsFeatureKey,
  playlistsReducer,
  playlistTrackFeatureKey,
  PlaylistTracksEffect,
  playlistTracksReducer
} from '@angular-spotify/web/playlist/data-access';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { extModules } from './build-specifics';
import { onViewTransitionCreated } from '@angular-spotify/shared/view-transition';
registerLocaleData(en);

const rootReducers = {
  [playlistsFeatureKey]: playlistsReducer,
  [playlistTrackFeatureKey]: playlistTracksReducer
};

@NgModule({
  imports: [
    CommonModule,
    WebLayoutModule,
    IconModule,
    NoopAnimationsModule,
    StoreModule.forRoot(rootReducers),
    EffectsModule.forRoot([ApplicationEffects, PlaylistsEffect, PlaylistTracksEffect]),
    SettingsModule,
    ...extModules
  ],
  exports: [RouterModule],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true
      })
    },
    // Sentry router tracing. TraceService subscribes to Router events to open a
    // transaction per navigation; the no-op APP_INITIALIZER forces Angular DI to
    // instantiate it at bootstrap (nothing else injects it). See @sentry/angular:
    // https://github.com/getsentry/sentry-javascript/blob/8.55.1/packages/angular/README.md#tracing
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => (): void => undefined,
      deps: [Sentry.TraceService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (store: Store) => () => {
        store.dispatch(AppInit());
      },
      multi: true,
      deps: [Store]
    },
    provideRouter(
      webShellRoutes,
      withViewTransitions({
        onViewTransitionCreated
      })
    )
  ],
  declarations: []
})
export class WebShellModule {}
