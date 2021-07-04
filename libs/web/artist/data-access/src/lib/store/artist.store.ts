import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { ArtistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouterUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { filter, pluck, switchMap, tap } from 'rxjs/operators';

interface ArtistState extends GenericState<SpotifyApi.ArtistObjectFull> {
  artistId: string;
}

@Injectable()
export class ArtistStore extends ComponentStore<ArtistState> {
  artistIdParams$: Observable<string> = this.route.params.pipe(
    pluck(RouterUtil.Configuration.ArtistId),
    filter((artistId: string) => !!artistId)
  );

  isArtistLoading$ = this.select(SelectorUtil.isLoading);

  artist$ = this.artistIdParams$.pipe(
    tap((artistId) => {
      this.patchState({
        artistId
      });
      this.loadArtist({ artistId });
    }),
    switchMap(() => this.select((s) => s.data))
  );


  loadArtist = this.effect<{ artistId: string }>((params$) =>
    params$.pipe(
      tap(() => {
        this.patchState({
          status: 'loading',
          error: null
        });
      }),
      switchMap(({ artistId }) =>
        this.artistApi.getArtist(artistId).pipe(
          tapResponse(
            (artist) => {
              this.patchState({
                data: artist,
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

  constructor(private route: ActivatedRoute, private artistApi: ArtistApiService) {
    super(<ArtistState>{});
  }
}
