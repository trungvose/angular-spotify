import { PlaylistStore } from '@angular-spotify/web/playlist/data-access';
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
  playlist$!: Observable<SpotifyApi.PlaylistObjectSimplified | undefined>;
  tracks$!: Observable<SpotifyApi.PlaylistTrackResponse | undefined>;
  isPlaylistPlaying$!: Observable<boolean>;

  constructor(private store: PlaylistStore) {
    this.playlist$ = this.store.playlist$;
    this.isPlaylistPlaying$ = this.store.isPlaylistPlaying$;
    this.tracks$ = this.store.tracks$;
  }

  togglePlaylist(isPlaying: boolean, playlist: SpotifyApi.PlaylistObjectSimplified) {
    this.store.togglePlaylist({
      isPlaying,
      playlist
    });
  }

  playTrack(playlist: SpotifyApi.PlaylistObjectSimplified, position: number) {
    this.store.playTrack({
      playlist,
      position
    });
  }
}
