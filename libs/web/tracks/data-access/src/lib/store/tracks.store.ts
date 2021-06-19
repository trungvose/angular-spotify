import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { mergeMap, tap } from 'rxjs/operators';
import {SelectorUtil} from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';

type TracksState = GenericState<SpotifyApi.UsersSavedTracksResponse>;

@Injectable()
export class TracksStore extends ComponentStore<TracksState> {
  loadTracks = this.effect((params$) =>
    params$.pipe(
      tap(() => {
        this.patchState({
          status: 'loading',
          error: null
        });
      }),
      mergeMap(() =>
        this.trackApi.getUserSavedTracks().pipe(
          tapResponse(
            (response) => {
              this.patchState({
                data: response,
                status: 'success',
                error: ''
              });
            },
            (error) => {
              this.patchState({
                status: 'error',
                error: error as string
              });
            }
          )
        )
      )
    )
  );
  
  vm$ = this.select(s => ({
    ...s,
    isLoading: SelectorUtil.isLoading(s)
  }))

  constructor(private trackApi: TrackApiService) {
    super(<TracksState>{});
  }
}
