import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { StoreModule } from '@ngrx/store';
import {
  CategoriesEffect,
  categoriesFeatureKey,
  categoriesReducer
} from '@angular-spotify/web/browse/data-access';
import { EffectsModule } from '@ngrx/effects';

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
    ]),
    StoreModule.forFeature(categoriesFeatureKey, categoriesReducer),
    EffectsModule.forFeature([CategoriesEffect])
  ]
})
export class BrowseShellModule {}
