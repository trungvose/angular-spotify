import { PlaylistStore } from '@angular-spotify/web/playlist/data-access';
import { RouteUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'as-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  providers: [PlaylistStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  playlistId$: Observable<string>;
  playlist$: Observable<SpotifyApi.PlaylistObjectSimplified | undefined>;
  tracks$: Observable<SpotifyApi.PlaylistTrackResponse | undefined>;
  isPlaylistPlaying$: Observable<boolean>;
  isPlaylistTracksLoading$: Observable<boolean>;
  isCurrentPlaylistLoading$: Observable<boolean>;

  constructor(private store: PlaylistStore) {
    this.playlistId$ = this.store.playlistId$;
    this.playlist$ = this.store.playlist$;
    this.isPlaylistPlaying$ = this.store.isPlaylistPlaying$;
    this.isCurrentPlaylistLoading$ = this.store.isCurrentPlaylistLoading$;
    this.tracks$ = this.store.tracks$;
    this.isPlaylistTracksLoading$ = this.store.isPlaylistTracksLoading$;
  }

  togglePlaylist(isPlaying: boolean) {
    this.store.togglePlaylist({
      isPlaying
    });
  }

  playTrack(position: number) {
    this.store.playTrack({
      position
    });
  }

  getPlaylistContextUri(playlistId: string | null) {
    return RouteUtil.getPlaylistContextUri(playlistId || '');
  }
}
