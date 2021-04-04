import { PlaylistsResponseWithRoute } from '@angular-spotify/web/shared/data-access/models';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-playlist-list',
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistListComponent {
  @Input() playlists!: PlaylistsResponseWithRoute | null;
  @Input() isLoading!: boolean | null;

  constructor(private playerApi: PlayerApiService) {}

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
