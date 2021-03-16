import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from './play-button.component';
import { SvgIconsModule } from '@ngneat/svg-icon';

@NgModule({
  imports: [CommonModule, SvgIconsModule],
  declarations: [PlayButtonComponent],
  exports: [PlayButtonComponent]
})
export class PlayButtonModule {}
