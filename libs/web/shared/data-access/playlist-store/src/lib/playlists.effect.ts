import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { loadPlaylists, loadPlaylistsSuccess } from './playlists.action';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlaylistsEffect {
  loadPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPlaylists),
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

  constructor(private actions$: Actions, private playlistsApi: PlaylistApiService) {}
}
