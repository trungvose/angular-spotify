import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';

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
    ])
  ]
})
export class AlbumShellModule {}
