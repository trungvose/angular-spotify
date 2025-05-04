import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class VisualizerComponent {}
