import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { switchMap } from 'rxjs/operators';

type TogglePlaylistParams = {
  isPlaying: boolean;
  playlist: SpotifyApi.PlaylistObjectSimplified;
};

type PlayTrackParams = {
  playlist: SpotifyApi.PlaylistObjectSimplified;
  position: number;
};

@Injectable({ providedIn: 'root' })
export class PlaylistStore extends ComponentStore<Record<string, unknown>> {
  constructor(private playerApi: PlayerApiService) {
    super({});
  }

  readonly togglePlaylist = this.effect<TogglePlaylistParams>((params$) =>
    params$.pipe(
      switchMap(({ isPlaying, playlist }) =>
        this.playerApi.togglePlay(isPlaying, {
          context_uri: playlist.uri
        })
      )
    )
  );

  readonly playTrack = this.effect<PlayTrackParams>((params$) =>
    params$.pipe(
      switchMap(({ playlist, position }) =>
        this.playerApi.play({
          context_uri: playlist.uri,
          offset: {
            position
          }
        })
      )
    )
  );
}
