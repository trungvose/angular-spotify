import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { LetModule, PushModule } from '@ngrx/component';
import { WebVisualizerUiComponent } from './web-visualizer-ui.component';

@NgModule({
  imports: [CommonModule, SvgIconsModule, LetModule, PushModule],
  declarations: [WebVisualizerUiComponent],
  exports: [WebVisualizerUiComponent]
})
export class WebVisualizerUiModule {}
