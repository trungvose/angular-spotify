import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { loadFeaturedPlaylists, loadFeaturedPlaylistsSuccess } from './feature-playlists.action';

@Injectable({ providedIn: 'root' })
export class FeaturePlaylistsEffect {
  constructor(
    private browseApi: BrowseApiService,
    private actions$: Actions
  ) {}

  loadFeaturedPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFeaturedPlaylists),
      mergeMap(() =>
        this.browseApi
          .getAllFeaturedPlaylists({
            limit: 20,
            country: 'VN'
          })
          .pipe(
            map((response) =>
              loadFeaturedPlaylistsSuccess({
                response
              })
            ),
            catchError(() => EMPTY)
          )
      )
    )
  );
}
