import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { PlayerApiService, PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { getPlaylistTracksById, getPlaylistTracksLoading, loadPlaylistTracks } from '../playlist-tracks';
import { getPlaylist, getPlaylistsState, loadPlaylistSuccess } from '../playlists';

interface PlaylistState extends GenericState<SpotifyApi.PlaylistObjectFull> {
  playlistId: string;
}

type TogglePlaylistParams = {
  isPlaying: boolean;
};

type PlayTrackParams = {
  position: number;
};

@Injectable({ providedIn: 'root' })
export class PlaylistStore extends ComponentStore<PlaylistState> {
  playlistParams$: Observable<string> = this.route.params.pipe(
    map((params) => params.playlistId),
    filter((playlistId: string) => !!playlistId)
  );

  isCurrentPlaylistLoading$ = this.select(SelectorUtil.isLoading);
  isPlaylistTracksLoading$ = this.store.select(getPlaylistTracksLoading);

  playlist$ = this.playlistParams$.pipe(
    tap((playlistId) => {
      this.patchState({
        playlistId
      });
      this.loadPlaylist({ playlistId });
    }),
    switchMap((playlistId) => this.store.pipe(select(getPlaylist(playlistId))))
  );

  tracks$ = this.playlistParams$.pipe(
    tap((playlistId) => {
      this.store.dispatch(
        loadPlaylistTracks({
          playlistId
        })
      );
    }),
    switchMap((playlistId) => this.store.pipe(select(getPlaylistTracksById(playlistId))))
  );

  isPlaylistPlaying$ = SelectorUtil.getMediaPlayingState(
    combineLatest([
      this.playlist$.pipe(map((playlist) => playlist?.uri)),
      this.playbackStore.playback$
    ])
  );

  readonly loadPlaylist = this.effect<{ playlistId: string }>((params$) =>
    params$.pipe(
      withLatestFrom(this.store.select(getPlaylistsState)),
      filter(([params, state]) => !state.map?.get(params.playlistId)),
      tap(() => {
        this.patchState({
          status: 'loading',
          error: null
        });
      }),
      map(([params]) => params),
      switchMap(({ playlistId }) =>
        this.playlistsApi.getById(playlistId).pipe(
          tapResponse(
            (playlist) => {
              this.store.dispatch(
                loadPlaylistSuccess({
                  playlist
                })
              );
              this.patchState({
                status: 'success',
                error: null
              });
            },
            (e) => {
              this.patchState({
                status: 'error',
                error: e as unknown as string
              });
            }
          )
        )
      )
    )
  );

  readonly togglePlaylist = this.effect<TogglePlaylistParams>((params$) =>
    params$.pipe(
      switchMap(({ isPlaying }) =>
        this.playerApi.togglePlay(isPlaying, {
          context_uri: this.playlistContextUri
        })
      )
    )
  );

  readonly playTrack = this.effect<PlayTrackParams>((params$) =>
    params$.pipe(
      switchMap(({ position }) =>
        this.playerApi.play({
          context_uri: this.playlistContextUri,
          offset: {
            position
          }
        })
      )
    )
  );

  readonly playlistId$ = this.select((s) => s.playlistId);

  get playlistContextUri() {
    return RouteUtil.getPlaylistContextUri(this.get().playlistId);
  }

  constructor(
    private playerApi: PlayerApiService,
    private playlistsApi: PlaylistApiService,
    private route: ActivatedRoute,
    private store: Store,
    private playbackStore: PlaybackStore
  ) {
    super({
      data: null,
      error: null,
      status: 'pending',
      playlistId: ''
    });
  }
}
