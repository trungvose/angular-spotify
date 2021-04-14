import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Actions } from 'mini-rx-store';
import { ofType } from 'ts-action-operators';
import { EMPTY } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { loadFeaturedPlaylists, loadFeaturedPlaylistsSuccess } from './feature-playlists.action';

@Injectable({ providedIn: 'root' })
export class FeaturePlaylistsEffect {
  constructor(
    private browseApi: BrowseApiService,
    private actions$: Actions,
    private authStore: AuthStore
  ) {}

  loadFeaturedPlaylists$ =
    this.actions$.pipe(
      ofType(loadFeaturedPlaylists),
      withLatestFrom(this.authStore.country$),
      mergeMap(([_, country]) =>
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
  );
}
