import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loadCategories, loadCategoriesSuccess } from './categories.action';
import { switchMap, map, withLatestFrom, filter } from 'rxjs/operators';
import { BrowseApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { getCategories } from './categories.selector';
import { select, Store } from '@ngrx/store';

@Injectable()
export class CategoriesEffect {
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      withLatestFrom(this.store.pipe(select(getCategories))),
      filter(([, data]) => !data),
      switchMap(() =>
        this.browseApi.getAllCategories().pipe(
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
    private browseApi: BrowseApiService
  ) {}
}
