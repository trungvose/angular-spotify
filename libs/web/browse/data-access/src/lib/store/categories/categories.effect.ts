import { Injectable } from '@angular/core';
import { Actions, Store } from 'mini-rx-store';
import { ofType } from 'ts-action-operators';
import { loadCategories, loadCategoriesSuccess, setCategoriesState } from './categories.action';
import { switchMap, map, withLatestFrom, filter, tap } from 'rxjs/operators';
import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { getCategories } from './categories.selector';

@Injectable()
export class CategoriesEffect {
  loadCategories$ =
    this.actions$.pipe(
      ofType(loadCategories),
      withLatestFrom(this.store.select(getCategories)),
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
    );

  constructor(
    private store: Store,
    private actions$: Actions,
    private browseApi: BrowseApiService,
    private authStore: AuthStore
  ) {}
}
