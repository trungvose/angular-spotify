import { Injectable } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';

import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import {
  SearchApiService,
  SearchResponse
} from '@angular-spotify/web/shared/data-access/spotify-api';

type SearchState = GenericState<SearchResponse>;

@Injectable()
export class SearchStore extends ComponentStore<SearchState> {
  readonly data$ = this.select((s) => s.data);
  readonly status$ = this.select((s) => s.status);
  readonly error$ = this.select((s) => s.error);

  readonly vm$ = this.select(
    this.data$,
    this.error$,
    this.status$,
    (data, error, status) => ({ data, error, status }),
    { debounce: true }
  );

  search = this.effect<string>((params$) =>
    params$.pipe(
      filter((term) => !!term),
      tap(() => this.patchState({ status: 'loading', error: null })),
      switchMap((term) =>
        this.searchApiService.search(term, { limit: 5 }).pipe(
          tapResponse(
            (data) => {
              this.patchState({
                data,
                status: 'success',
                error: ''
              });
            },
            (error) => this.patchState({ status: 'error', error: error as string })
          )
        )
      )
    )
  );

  constructor(private searchApiService: SearchApiService) {
    super(<SearchState>{ data: {} });
  }
}
