import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AlbumApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { loadAlbums, loadAlbumsSuccess } from './albums.action';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlbumsEffect {
  loadAlbums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAlbums),
      switchMap(() =>
        this.albumApi.getUserSavedAlbums().pipe(
          map((albums) => loadAlbumsSuccess({ albums })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(private actions$: Actions, private albumApi: AlbumApiService) {}
}
