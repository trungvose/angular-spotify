import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  AlbumsEffect,
  albumsFeatureKey,
  albumsReducer
} from '@angular-spotify/web/album/data-access';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        loadChildren: async () =>
          (await import('@angular-spotify/web/album/feature/list')).AlbumsModule
      },
      {
        path: `:${RouterUtil.Configuration.AlbumId}`,
        loadChildren: async () =>
          (await import('@angular-spotify/web/album/feature/detail')).AlbumModule
      }
    ]),
    StoreModule.forFeature(albumsFeatureKey, albumsReducer),
    EffectsModule.forFeature([AlbumsEffect])
  ]
})
export class AlbumShellModule {}
