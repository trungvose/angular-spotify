import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { webShellRoutes } from './web-shell.routes';
import { WebLayoutModule } from '@angular-spotify/web/shell/ui/layout';
import { IconModule } from '@angular-spotify/web/shared/ui/icon';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import * as Sentry from '@sentry/angular';

/** config angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {
  PlaylistsEffect,
  playlistsFeatureKey,
  playlistsReducer,
  playlistTrackFeatureKey,
  PlaylistTracksEffect,
  playlistTracksReducer
} from '@angular-spotify/web/playlist/data-access';
import { extModules } from './build-specifics';
import { EffectsModule, StoreModule } from 'mini-rx-store-ng';
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
    RouterModule.forRoot(webShellRoutes, {
      scrollPositionRestoration: 'top'
    }),
    StoreModule.forRoot({reducers: rootReducers}),
    EffectsModule.register([PlaylistsEffect, PlaylistTracksEffect]),
    ...extModules,
  ],
  exports: [RouterModule],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true
      })
    }
  ],
  declarations: []
})
export class WebShellModule {}
