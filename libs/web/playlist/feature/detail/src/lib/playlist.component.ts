import { PlaylistStore } from '@angular-spotify/web/playlist/data-access';
import { RouteUtil } from '@angular-spotify/web/shared/utils';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

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
  standalone: false
})
export class PlaylistComponent {
  playlistId$ = this.store.playlistId$;
  playlist = toSignal(this.store.playlist$, { initialValue: null });
  isPlaylistPlaying$ = this.store.isPlaylistPlaying$;
  isCurrentPlaylistLoading$ = this.store.isCurrentPlaylistLoading$;
  tracks = toSignal(this.store.tracks$, { initialValue: null  });
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
