import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from './play-button.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { LetModule, PushModule } from '@ngrx/component';

@NgModule({
  imports: [CommonModule, SvgIconsModule, LetModule, PushModule],
  declarations: [PlayButtonComponent],
  exports: [PlayButtonComponent]
})
export class PlayButtonModule {}
