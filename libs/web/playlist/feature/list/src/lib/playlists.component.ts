import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouteUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getPlaylists, getPlaylistsLoading } from '@angular-spotify/web/playlist/data-access';

@Component({
  selector: 'as-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistsComponent {
  playlists$ = this.store.pipe(select(getPlaylists));
  isPlaylistsLoading$ = this.store.pipe(select(getPlaylistsLoading));

  constructor(private store: Store, private playerApi: PlayerApiService) {    
  }

  getPlaylistRouteUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return RouteUtil.getPlaylistRouteUrl(playlist);
  }

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
