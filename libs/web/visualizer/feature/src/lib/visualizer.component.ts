import { initVisualizer } from '@angular-spotify/web/visualizer/data-access';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
@Component({
  selector: 'as-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent implements OnInit {
  @ViewChild('visualizer', { static: true }) visualizer!: ElementRef;

  ngOnInit(): void {
    initVisualizer(this.visualizer.nativeElement);
  }
}
