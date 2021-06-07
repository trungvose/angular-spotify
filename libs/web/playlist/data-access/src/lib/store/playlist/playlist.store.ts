import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import {
  PlayerApiService,
  PlaylistApiService
} from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  getPlaylistTracksById,
  getPlaylistTracksLoading,
  loadPlaylistTracks
} from '../playlist-tracks';
import { getPlaylist, getPlaylistsState, loadPlaylistSuccess } from '../playlists';
import { FeatureStore, Store } from 'mini-rx-store';

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
export class PlaylistStore extends FeatureStore<PlaylistState> {
  playlistParams$: Observable<string> = this.route.params.pipe(
    map((params) => params.playlistId),
    filter((playlistId: string) => !!playlistId)
  );

  isCurrentPlaylistLoading$ = this.select(SelectorUtil.isLoading);
  isPlaylistTracksLoading$ = this.store.select(getPlaylistTracksLoading);

  playlist$ = this.playlistParams$.pipe(
    tap((playlistId) => {
      this.setState({
        playlistId
      });
      this.loadPlaylist({ playlistId });
    }),
    switchMap((playlistId) => this.store.select(getPlaylist(playlistId)))
  );

  tracks$ = this.playlistParams$.pipe(
    tap((playlistId) => {
      this.store.dispatch(
        loadPlaylistTracks({
          playlistId
        })
      );
    }),
    switchMap((playlistId) => this.store.select(getPlaylistTracksById(playlistId)))
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
        this.setState({
          status: 'loading',
          error: null
        });
      }),
      map(([params]) => params),
      mergeMap(({ playlistId }) =>
        this.playlistsApi.getById(playlistId).pipe(
          tap(
            (playlist) => {
              this.store.dispatch(
                loadPlaylistSuccess({
                  playlist
                })
              );
              this.setState({
                status: 'success',
                error: null
              });
            }
          ),
          catchError(e => {
            this.setState({
              status: 'error',
              error: e as string
            });
            return EMPTY;
          })
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
    return RouteUtil.getPlaylistContextUri(this.state.playlistId);
  }

  constructor(
    private playerApi: PlayerApiService,
    private playlistsApi: PlaylistApiService,
    private route: ActivatedRoute,
    private store: Store,
    private playbackStore: PlaybackStore
  ) {
    super('playlist', {
      data: null,
      error: null,
      status: 'pending',
      playlistId: ''
    });
  }
}
