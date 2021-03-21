import { initVisualizer } from '@angular-spotify/web/visualizer/data-access';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Sketch } from 'sketch-js';
@Component({
  selector: 'as-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent implements OnInit, OnDestroy {
  sketch!: Sketch;
  @ViewChild('visualizer', { static: true }) visualizer!: ElementRef;

  ngOnInit(): void {
    this.sketch = initVisualizer(this.visualizer.nativeElement);
  }

  ngOnDestroy() {
    this.sketch.destroy();
  }
}
