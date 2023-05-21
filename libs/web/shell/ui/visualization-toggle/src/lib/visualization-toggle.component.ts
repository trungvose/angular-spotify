import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { VisualizerStore } from '@angular-spotify/web/visualizer/data-access';

@Component({
  selector: 'as-visualization-toggle',
  templateUrl: './visualization-toggle.component.html',
  styleUrls: ['./visualization-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizationToggleComponent {
  isVisualizationOn$ = this.visualizerStore.isVisible$;
  isPlaying$ = this.playbackStore.isPlaying$;

  constructor(private visualizerStore: VisualizerStore, private playbackStore: PlaybackStore) {}

  toggle(isVisible: boolean) {
    this.visualizerStore.setVisibility({ isVisible });
  }
}
