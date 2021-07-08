import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { PlayerApiService, TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { switchMap, tap } from 'rxjs/operators';

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
      switchMap(() =>
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
                error: error as unknown as string
              });
            }
          )
        )
      )
    )
  );

  playTrack = this.effect<{ track: SpotifyApi.TrackObjectFull }>((params$) =>
    params$.pipe(
      switchMap(({ track }) =>
        this.playerApi.play({
          context_uri: track.album.uri,
          offset: {
            position: track.track_number - 1
          }
        })
      )
    )
  );

  vm$ = this.select((s) => ({
    ...s,
    isLoading: SelectorUtil.isLoading(s)
  }));

  constructor(private trackApi: TrackApiService, private playerApi: PlayerApiService) {
    super(<TracksState>{});
  }
}
