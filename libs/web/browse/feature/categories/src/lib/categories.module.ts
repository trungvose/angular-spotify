import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './categories.component';
import { SpinnerComponent } from '@angular-spotify/web/shared/ui/spinner';
import { CategoryCoverComponent } from 'libs/web/browse/ui/category-cover/src/lib/category-cover.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CategoriesComponent
      }
    ]),
    CategoryCoverComponent,
    SpinnerComponent
  ],
  declarations: [CategoriesComponent],
  exports: [CategoriesComponent]
})
export class BrowseCategoriesModule {}
