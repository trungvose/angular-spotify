import { PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { getPlaylistTracksState } from './playlist-tracks.selector';
import {
  loadPlaylistTracks,
  loadPlaylistTracksSuccess,
  statePlaylistTracksStateStatus
} from './playlist-tracks.action';

@Injectable({ providedIn: 'root' })
export class PlaylistTracksEffect {
  loadPlaylistTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPlaylistTracks),
      withLatestFrom(this.store.pipe(select(getPlaylistTracksState))),
      tap(([{ playlistId }, playlistTracks]) => {
        if (playlistTracks.data?.has(playlistId)) {
          this.store.dispatch(
            statePlaylistTracksStateStatus({
              status: 'success'
            })
          );
        }
      }),
      filter(([{ playlistId }, playlistTracks]) => {
        return !playlistTracks.data?.has(playlistId);
      }),
      mergeMap(([{ playlistId }]) =>
        this.playlistsApi.getTracks(playlistId).pipe(
          map((playlistTracks) =>
            loadPlaylistTracksSuccess({
              playlistId,
              playlistTracks
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
    private store: Store
  ) {}
}
