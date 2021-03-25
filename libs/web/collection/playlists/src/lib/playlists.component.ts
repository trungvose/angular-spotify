import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  getPlaylists,
  loadPlaylists,
  RootState
} from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
import { RouteUtil } from '@angular-spotify/web/util';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { getPlaylistsLoading } from '@angular-spotify/web/shared/data-access/store';
@Component({
  selector: 'as-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistsComponent implements OnInit {
  isPlaylistsLoading$: Observable<boolean>;
  playlists$: Observable<SpotifyApi.ListOfUsersPlaylistsResponse | null>;

  constructor(private store: Store<RootState>, private playerApi: PlayerApiService) {
    this.playlists$ = this.store.pipe(select(getPlaylists));
    this.isPlaylistsLoading$ = this.store.pipe(select(getPlaylistsLoading));
  }

  ngOnInit(): void {
    this.store.dispatch(loadPlaylists());
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
