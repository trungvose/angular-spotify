import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import {
  loadPlaylist,
  loadPlaylists,
  loadPlaylistsSuccess,
  loadPlaylistSuccess
} from './playlists.action';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { RootState } from '../rootState';
import { getPlaylistsState } from './playlists.selector';

@Injectable({ providedIn: 'root' })
export class PlaylistsEffect {
  loadPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPlaylists),
      withLatestFrom(this.store.pipe(select(getPlaylistsState))),
      filter(([, playlistState]) => !playlistState.data),
      mergeMap(() =>
        this.playlistsApi.getAll().pipe(
          map((playlists) =>
            loadPlaylistsSuccess({
              playlists
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  loadPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPlaylist),
      withLatestFrom(this.store.select(getPlaylistsState)),
      filter(([action, state]) => !state.map?.get(action.playlistId)),
      map(([action, state]) => action),
      mergeMap(({ playlistId }) =>
        this.playlistsApi.getById(playlistId).pipe(
          map((playlist) =>
            loadPlaylistSuccess({
              playlist
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private playlistsApi: PlaylistApiService,
    private store: Store<RootState>
  ) {}
}
