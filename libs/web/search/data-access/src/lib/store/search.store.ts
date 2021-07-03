import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { SearchApiService, SearchResponse } from '@angular-spotify/web/shared/data-access/spotify-api';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { filter, switchMap, tap } from 'rxjs/operators';

type SearchState = GenericState<SearchResponse>;

@Injectable()
export class SearchStore extends ComponentStore<SearchState> {
  readonly data$ = this.select((s) => s.data);
  readonly status$ = this.select((s) => s.status);
  readonly error$ = this.select((s) => s.error);
  readonly isLoading$ = this.select(SelectorUtil.isLoading);

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
        this.searchApiService.search(term, { limit: 8 }).pipe(
          tapResponse(
            (data) => {
              this.patchState({
                data,
                status: 'success',
                error: ''
              });
            },
            (error) => this.patchState({ status: 'error', error: error as unknown as string })
          )
        )
      )
    )
  );

  constructor(private searchApiService: SearchApiService) {
    super(<SearchState>{ data: {} });
  }
}
