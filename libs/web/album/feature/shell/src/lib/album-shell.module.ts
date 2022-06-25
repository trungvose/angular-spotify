import {
  AlbumsEffect,
  albumsFeatureKey,
  albumsReducer
} from '@angular-spotify/web/album/data-access';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { importProvidersFrom } from '@angular/core';
import { Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

export const ALBUM_ROUTES: Routes = [
  {
    path: '',
    providers: [
      importProvidersFrom(
        StoreModule.forFeature(albumsFeatureKey, albumsReducer),
        EffectsModule.forFeature([AlbumsEffect])
      )
    ],
    children: [
      {
        path: '',
        loadComponent: async () => (await import('@angular-spotify/web/album/feature/list')).AlbumsComponent
      },
      {
        path: `:${RouterUtil.Configuration.AlbumId}`,
        loadComponent: async () => (await import('@angular-spotify/web/album/feature/detail')).AlbumComponent
      }
    ]
  }
];