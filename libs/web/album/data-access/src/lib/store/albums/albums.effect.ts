import { Injectable } from '@angular/core';
import { AlbumApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { loadAlbums, loadAlbumsSuccess } from './albums.action';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { Actions } from 'mini-rx-store';
import { ofType } from 'ts-action-operators';

@Injectable({ providedIn: 'root' })
export class AlbumsEffect {
  loadAlbums$ =
    this.actions$.pipe(
      ofType(loadAlbums),
      mergeMap(() =>
        this.albumApi.getUserSavedAlbums().pipe(
          map((albums) => loadAlbumsSuccess({ albums })),
          catchError(() => EMPTY)
        )
      )
    );

  constructor(private actions$: Actions, private albumApi: AlbumApiService) {}
}
