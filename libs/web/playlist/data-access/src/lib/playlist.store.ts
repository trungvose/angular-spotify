import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import {
  getPlaylist,
  getPlaylistTracksById,
  loadPlaylist,
  loadPlaylistTracks,
  PlaybackStore,
  RootState
} from '@angular-spotify/web/shared/data-access/store';
import { SelectorUtil } from '@angular-spotify/web/util';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

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
  playlist$!: Observable<SpotifyApi.PlaylistObjectSimplified | undefined>;
  tracks$!: Observable<SpotifyApi.PlaylistTrackResponse | undefined>;
  isPlaylistPlaying$!: Observable<boolean>;

  constructor(
    private playerApi: PlayerApiService,
    private route: ActivatedRoute,
    private store: Store<RootState>,
    private playbackStore: PlaybackStore
  ) {
    super({});
    this.init();
  }

  init() {
    const playlistParams$: Observable<string> = this.route.params.pipe(
      map((params) => params.playlistId),
      filter((playlistId) => !!playlistId)
    );

    this.playlist$ = playlistParams$.pipe(
      tap((playlistId) => {
        this.store.dispatch(
          loadPlaylist({
            playlistId
          })
        );
      }),
      switchMap((playlistId) => this.store.pipe(select(getPlaylist(playlistId))))
    );

    this.tracks$ = playlistParams$.pipe(
      tap((playlistId) => {
        this.store.dispatch(
          loadPlaylistTracks({
            playlistId
          })
        );
      }),
      switchMap((playlistId) => this.store.pipe(select(getPlaylistTracksById(playlistId))))
    );

    this.isPlaylistPlaying$ = SelectorUtil.getMediaPlayingState(
      combineLatest([
        this.playlist$.pipe(map((playlist) => playlist?.uri)),
        this.playbackStore.playback$
      ])
    );
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
