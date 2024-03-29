import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { LetDirective, PushPipe } from '@ngrx/component';
import { WebVisualizerUiComponent } from './web-visualizer-ui.component';

@NgModule({
  imports: [CommonModule, SvgIconComponent, LetDirective, PushPipe],
  declarations: [WebVisualizerUiComponent],
  exports: [WebVisualizerUiComponent]
})
export class WebVisualizerUiModule {}
