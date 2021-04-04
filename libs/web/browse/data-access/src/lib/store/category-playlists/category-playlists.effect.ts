import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  loadCategoryPlaylists,
  loadCategoryPlaylistsSuccess,
  setCategoryPlaylistsState
} from './category-playlists.action';
import { getCategoryPlaylistsMap } from './category-playlists.selector';

@Injectable()
export class CategoryPlaylistsEffect {
  loadCategoryPlaylists$ = createEffect(() =>
    this.actions.pipe(
      ofType(loadCategoryPlaylists),
      withLatestFrom(this.store.pipe(select(getCategoryPlaylistsMap))),
      tap(([{ categoryId }, map]) => {
        if (map?.has(categoryId)) {
          this.store.dispatch(
            setCategoryPlaylistsState({
              status: 'success'
            })
          );
        }
      }),
      filter(([{ categoryId }, map]) => {
        return !map?.has(categoryId);
      }),
      switchMap(([{ categoryId }]) =>
        this.browseApi.getCategoryPlaylists(categoryId).pipe(
          map((playlists) =>
            loadCategoryPlaylistsSuccess({
              categoryId,
              playlists
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(
    private browseApi: BrowseApiService,
    private actions: Actions,
    private store: Store
  ) {}
}
