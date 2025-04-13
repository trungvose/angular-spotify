import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerControlsComponent } from '@angular-spotify/web/shell/ui/player-controls';
import { PlayerPlaybackComponent } from '@angular-spotify/web/shell/ui/player-playback';
import { PlayerVolumeComponent } from '@angular-spotify/web/shell/ui/player-volume';
import { VisualizationToggleComponent } from '@angular-spotify/web/shell/ui/visualization-toggle';
import { TrackCurrentInfoComponent } from '@angular-spotify/web/shared/ui/track-current-info';
@Component({
  selector: 'as-now-playing-bar',
  templateUrl: './now-playing-bar.component.html',
  styleUrls: ['./now-playing-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      CommonModule,
      PlayerControlsComponent,
      PlayerPlaybackComponent,
      TrackCurrentInfoComponent,
      PlayerVolumeComponent,
      VisualizationToggleComponent
    ],
})
export class NowPlayingBarComponent {
  currentTrack$ = this.playbackStore.currentTrack$;

  constructor(private playbackStore: PlaybackStore) {
  }
}
