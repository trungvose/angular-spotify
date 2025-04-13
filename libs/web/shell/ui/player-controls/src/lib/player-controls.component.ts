import { PlaybackService, PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { PlayButtonComponent } from '@angular-spotify/web/shared/ui/play-button';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { startWith } from 'rxjs/operators';
@Component({
  selector: 'as-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SvgIconComponent, PlayButtonComponent],
})
export class PlayerControlsComponent {
  isPlaying$ = this.playbackStore.isPlaying$.pipe(startWith(false));
  
  constructor(private playbackStore: PlaybackStore, private playbackService: PlaybackService) {
  }

  async togglePlay() {
    this.playbackService.play();
  }

  async next() {
    this.playbackService.next();
  }

  async prev() {
    this.playbackService.prev();
  }
}
