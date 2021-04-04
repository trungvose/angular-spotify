import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryCoverComponent } from './category-cover.component';
import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, MediaCoverModule, RouterModule],
  declarations: [CategoryCoverComponent],
  exports: [CategoryCoverComponent]
})
export class CategoryCoverModule {}
