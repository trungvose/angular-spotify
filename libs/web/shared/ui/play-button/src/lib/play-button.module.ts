import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from './play-button.component';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { LetDirective, PushPipe } from '@ngrx/component';

@NgModule({
  imports: [CommonModule, SvgIconComponent, LetDirective, PushPipe],
  declarations: [PlayButtonComponent],
  exports: [PlayButtonComponent]
})
export class PlayButtonModule {}



