import { PlaylistStore } from '@angular-spotify/web/playlist/data-access';
import { RouteUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-playlist',
  templateUrl: './playlist.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  providers: [PlaylistStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  playlistId$ = this.store.playlistId$;
  playlist$ = this.store.playlist$;
  isPlaylistPlaying$ = this.store.isPlaylistPlaying$;
  isCurrentPlaylistLoading$ = this.store.isCurrentPlaylistLoading$;
  tracks$ = this.store.tracks$;
  isPlaylistTracksLoading$ = this.store.isPlaylistTracksLoading$;

  constructor(private store: PlaylistStore) {}

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
