import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from './play-button.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { ReactiveComponentModule } from '@ngrx/component';

@NgModule({
  imports: [CommonModule, SvgIconsModule, ReactiveComponentModule],
  declarations: [PlayButtonComponent],
  exports: [PlayButtonComponent]
})
export class PlayButtonModule {}
