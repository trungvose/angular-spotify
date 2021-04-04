import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './categories.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CategoriesComponent
      }
    ])
  ],
  declarations: [CategoriesComponent],
  exports: [CategoriesComponent]
})
export class BrowseCategoriesModule {}
