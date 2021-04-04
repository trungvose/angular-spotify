import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loadCategories, loadCategoriesSuccess, setCategoriesState } from './categories.action';
import { switchMap, map, withLatestFrom, filter, tap } from 'rxjs/operators';
import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { getCategories } from './categories.selector';
import { select, Store } from '@ngrx/store';

@Injectable()
export class CategoriesEffect {
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      withLatestFrom(this.store.pipe(select(getCategories))),
      tap(([, categories]) => {
        if (categories) {
          this.store.dispatch(setCategoriesState({ status: 'success' }));
        }
      }),
      filter(([, data]) => !data),
      withLatestFrom(this.authStore.country$),
      switchMap(([, country]) =>
        this.browseApi
          .getAllCategories({
            country,
            limit: 50
          })
          .pipe(
            map((response) =>
              loadCategoriesSuccess({
                categories: response
              })
            )
          )
      )
    )
  );

  constructor(
    private store: Store,
    private actions$: Actions,
    private browseApi: BrowseApiService,
    private authStore: AuthStore
  ) {}
}
