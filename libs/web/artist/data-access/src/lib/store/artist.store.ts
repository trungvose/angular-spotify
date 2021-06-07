import { ActivatedRoute } from '@angular/router';
import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { RouterUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, filter, mergeMap, pluck, switchMap, tap } from 'rxjs/operators';
import { ArtistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { FeatureStore } from 'mini-rx-store';

interface ArtistState extends GenericState<SpotifyApi.ArtistObjectFull> {
  artistId: string;
}

@Injectable()
export class ArtistStore extends FeatureStore<ArtistState> {
  artistIdParams$: Observable<string> = this.route.params.pipe(
    pluck(RouterUtil.Configuration.ArtistId),
    filter((artistId: string) => !!artistId)
  );

  isArtistLoading$ = this.select(SelectorUtil.isLoading);

  artist$ = this.artistIdParams$.pipe(
    tap((artistId) => {
      this.setState({
        artistId
      });
      this.loadArtist({ artistId });
    }),
    switchMap(() => this.select((s) => s.data))
  );


  loadArtist = this.effect<{ artistId: string }>((params$) =>
    params$.pipe(
      tap(() => {
        this.setState({
          status: 'loading',
          error: null
        });
      }),
      mergeMap(({ artistId }) =>
        this.artistApi.getArtist(artistId).pipe(
          tap(
            (artist) => {
              this.setState({
                data: artist,
                status: 'success',
                error: ''
              });
            },
            (error) => {
              this.setState({
                status: 'error',
                error: error as string
              });
            }
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(private route: ActivatedRoute, private artistApi: ArtistApiService) {
    super('Artist', <ArtistState>{});
  }
}
