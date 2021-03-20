import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { loadPlaylists, loadPlaylistsSuccess } from './playlists.action';
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

  constructor(
    private actions$: Actions,
    private playlistsApi: PlaylistApiService,
    private store: Store<RootState>
  ) {}
}
