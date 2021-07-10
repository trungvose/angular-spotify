import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { filter, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ArtistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { ArtistStore } from './artist.store';

interface ArtistTopTracksState extends GenericState<SpotifyApi.ArtistsTopTracksResponse> {
  artistId: string;
}

@Injectable()
export class ArtistTopTracksStore extends ComponentStore<ArtistTopTracksState> {
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

  loadArtistTopTracks = this.effect<string>((params$) =>
    params$.pipe(
      filter(artistId => !!artistId),
      tap(() => this.patchState({ status: 'loading', error: null })),
      withLatestFrom(this.authStore.country$),
      switchMap(([artistId, country]) =>
        this.artistApi.getArtistTopTracks(artistId, country).pipe(
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

  constructor(
    private readonly artistStore: ArtistStore,
    private readonly authStore: AuthStore,
    private readonly artistApi: ArtistApiService
  ) {
    super(<ArtistTopTracksState>{});
    this.loadArtistTopTracks(
      this.artistStore.artistIdParams$
    );
  }
}
