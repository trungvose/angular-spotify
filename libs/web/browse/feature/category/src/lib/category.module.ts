import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category.component';
import { RouterModule } from '@angular/router';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
@NgModule({
  imports: [
    CommonModule,
    SpinnerModule,
    RouterModule.forChild([
      {
        path: '',
        component: CategoryComponent
      }
    ])
  ],
  declarations: [CategoryComponent],
  exports: [CategoryComponent]
})
export class BrowseCategoryModule {}
