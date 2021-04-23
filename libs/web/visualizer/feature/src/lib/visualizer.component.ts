import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent {}
