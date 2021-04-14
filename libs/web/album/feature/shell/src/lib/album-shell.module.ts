import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import {
  AlbumsEffect,
  albumsFeatureKey,
  albumsReducer
} from '@angular-spotify/web/album/data-access';
import { EffectsModule, StoreModule } from 'mini-rx-store-ng';
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
    EffectsModule.register([AlbumsEffect])
  ]
})
export class AlbumShellModule {}
