import { RouterUtil } from './router-util';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

export function redirectAlbumDetailGuard(next: ActivatedRouteSnapshot) {
  const router = inject(Router);
  const albumId = next.paramMap.get(RouterUtil.Configuration.AlbumId);
  router.navigate([RouterUtil.Configuration.Albums, albumId]);
  return true;
}
