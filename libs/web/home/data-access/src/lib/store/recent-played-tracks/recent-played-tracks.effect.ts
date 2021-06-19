import { Injectable } from '@angular/core';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loadRecentTracks, loadRecentTracksSuccess } from './recent-played-tracks.action';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecentPlayedTracksEffect {
  constructor(private playerApi: PlayerApiService, private actions$: Actions) {}

  loadRecentTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRecentTracks),
      switchMap(() =>
        this.playerApi.getRecentPlayedTracks().pipe(
          map((response) =>
            loadRecentTracksSuccess({
              response
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );
}
