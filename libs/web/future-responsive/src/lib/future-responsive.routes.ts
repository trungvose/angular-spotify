import { RouterUtil, redirectAlbumDetailGuard } from '@angular-spotify/web/shared/utils';
import { Routes } from '@angular/router';

export const futureResponsiveRoutes: Routes = [
  {
    path: '',
    loadComponent: async () =>
      (await import('./future-responsive.component')).FutureResponsiveComponent
  },
  {
    path: `:${RouterUtil.Configuration.AlbumId}`,
    canActivate: [redirectAlbumDetailGuard],
    children: []
  }
];
