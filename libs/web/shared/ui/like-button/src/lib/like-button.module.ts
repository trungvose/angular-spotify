import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { LetDirective } from '@ngrx/component';
import { LikeButtonComponent } from './like-button.component';

@NgModule({
  imports: [CommonModule, SvgIconComponent, LetDirective],
  declarations: [LikeButtonComponent],
  exports: [LikeButtonComponent]
})
export class LikeButtonModule {}
