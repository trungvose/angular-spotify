import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { loadFeaturedPlaylists, loadFeaturedPlaylistsSuccess } from './feature-playlists.action';

@Injectable({ providedIn: 'root' })
export class FeaturePlaylistsEffect {
  constructor(
    private browseApi: BrowseApiService,
    private actions$: Actions,
    private authStore: AuthStore
  ) {}

  loadFeaturedPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFeaturedPlaylists),
      withLatestFrom(this.authStore.country$),
      switchMap(([_, country]) =>
        this.browseApi
          .getAllFeaturedPlaylists({
            limit: 50,
            country: country || 'VN'
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
