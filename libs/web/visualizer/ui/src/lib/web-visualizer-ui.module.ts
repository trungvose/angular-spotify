import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebVisualizerUiComponent } from './web-visualizer-ui.component';

@NgModule({
  imports: [CommonModule],
  declarations: [WebVisualizerUiComponent],
  exports: [WebVisualizerUiComponent]
})
export class WebVisualizerUiModule {}
