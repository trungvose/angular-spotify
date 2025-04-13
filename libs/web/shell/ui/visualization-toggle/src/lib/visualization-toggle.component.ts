import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { VisualizerStore } from '@angular-spotify/web/visualizer/data-access';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { LetDirective, PushPipe } from '@ngrx/component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'as-visualization-toggle',
  templateUrl: './visualization-toggle.component.html',
  styleUrls: ['./visualization-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      CommonModule,
      NzSwitchModule,
      NzToolTipModule,
      FormsModule,
      LetDirective, PushPipe,
      SvgIconComponent
    ],
})
export class VisualizationToggleComponent {
  isVisualizationOn$ = this.visualizerStore.isVisible$;
  isPlaying$ = this.playbackStore.isPlaying$;

  constructor(private visualizerStore: VisualizerStore, private playbackStore: PlaybackStore) {}

  toggle(isVisible: boolean) {
    this.visualizerStore.setVisibility({ isVisible });
  }
}
