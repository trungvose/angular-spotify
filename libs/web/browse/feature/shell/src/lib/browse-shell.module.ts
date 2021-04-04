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
          (await import('@angular-spotify/web/browse/feature/categories')).BrowseCategoriesModule
      },
      {
        path: `:${RouterUtil.Configuration.CategoryId}`,
        loadChildren: async () =>
          (await import('@angular-spotify/web/browse/feature/category')).BrowseCategoryModule
      }
    ])
  ]
})
export class BrowseShellModule {}
