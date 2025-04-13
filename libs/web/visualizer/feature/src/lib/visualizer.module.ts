import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerComponent } from './visualizer.component';
import { RouterModule } from '@angular/router';
import { WebVisualizerUiComponent } from '@angular-spotify/web/visualizer/ui';

@NgModule({
  imports: [
    CommonModule,
    WebVisualizerUiComponent,
    RouterModule.forChild([
      {
        path: '',
        component: VisualizerComponent
      }
    ])
  ],
  declarations: [VisualizerComponent],
  exports: [VisualizerComponent]
})
export class VisualizerModule {}
