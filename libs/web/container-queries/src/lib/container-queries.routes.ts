import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';

export function containerQueriesDetailGuard(next: ActivatedRouteSnapshot) {
  const router = inject(Router);
  const albumId = next.paramMap.get(RouterUtil.Configuration.AlbumId);
  router.navigate([RouterUtil.Configuration.Albums, albumId]);
  return true;
}

export const containerQueriesRoutes: Routes = [
  {
    path: '',
    loadComponent: async () =>
      (await import('./container-queries.component')).ContainerQueriesComponent
  },
  {
    path: `:${RouterUtil.Configuration.AlbumId}`,
    canActivate: [containerQueriesDetailGuard],
    children: []
  }
];
