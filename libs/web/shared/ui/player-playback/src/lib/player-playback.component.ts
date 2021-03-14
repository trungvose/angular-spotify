import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-player-playback',
  templateUrl: './player-playback.component.html',
  styleUrls: ['./player-playback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerPlaybackComponent {}
