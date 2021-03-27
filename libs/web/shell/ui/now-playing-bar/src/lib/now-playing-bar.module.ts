import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NowPlayingBarComponent } from './now-playing-bar.component';
import { PlayerControlsModule } from '@angular-spotify/web/shell/ui/player-controls';
import { TrackCurrentInfoModule } from '@angular-spotify/web/shared/ui/track-current-info';
import { PlayerPlaybackModule } from '@angular-spotify/web/shell/ui/player-playback';
import { PlayerVolumeModule } from '@angular-spotify/web/shell/ui/player-volume';
import { VisualizationToggleModule } from '@angular-spotify/web/shell/ui/visualization-toggle';
@NgModule({
  imports: [
    CommonModule,
    PlayerControlsModule,
    PlayerPlaybackModule,
    TrackCurrentInfoModule,
    PlayerVolumeModule,
    VisualizationToggleModule
  ],
  declarations: [NowPlayingBarComponent],
  exports: [NowPlayingBarComponent]
})
export class NowPlayingBarModule {}
