import { PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Actions, Store } from 'mini-rx-store';
import { ofType } from 'ts-action-operators';
import { EMPTY } from 'rxjs';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { loadPlaylists, loadPlaylistsSuccess } from './playlists.action';
import { getPlaylistsState } from './playlists.selector';

@Injectable({ providedIn: 'root' })
export class PlaylistsEffect {
  loadPlaylists$ =
    this.actions$.pipe(
      ofType(loadPlaylists),
      withLatestFrom(this.store.select(getPlaylistsState)),
      filter(([, playlistState]) => !playlistState.data),
      mergeMap(() =>
        this.playlistsApi.getUserSavedPlaylists().pipe(
          map((playlists) =>
            loadPlaylistsSuccess({
              playlists
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )

  constructor(
    private actions$: Actions,
    private playlistsApi: PlaylistApiService,
    private store: Store
  ) {}
}
