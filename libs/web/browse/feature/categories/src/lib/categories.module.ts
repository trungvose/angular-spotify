import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './categories.component';
import { CategoryCoverModule } from '@angular-spotify/web/browse/ui/category-cover';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CategoriesComponent
      }
    ]),
    CategoryCoverModule
  ],
  declarations: [CategoriesComponent],
  exports: [CategoriesComponent]
})
export class BrowseCategoriesModule {}
