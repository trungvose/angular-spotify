import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
@Component({
  selector: 'as-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerControlsComponent {
  isPause$: Observable<boolean | undefined>;
  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {
    this.isPause$ = this.playbackStore.isPause$;
  }

  togglePlay(){
    this.playerApi.play({}).subscribe();
  }

  next() {
    this.playerApi.next().subscribe()
  }

  prev(){
    this.playerApi.prev().subscribe()
  }
}
