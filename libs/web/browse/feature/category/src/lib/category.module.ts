import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category.component';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '@angular-spotify/web/shared/ui/spinner';
import { PlaylistListComponent } from '@angular-spotify/web/shared/ui/playlist-list';
import { LetDirective, PushPipe } from '@ngrx/component';
@NgModule({
  imports: [
    CommonModule,
    SpinnerComponent,
    PlaylistListComponent,
    LetDirective, PushPipe,
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
