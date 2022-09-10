import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { AppInit } from './app-init.action';

@Injectable()
export class AppInitEffects {
  constructor(private actions$: Actions, private authStore: AuthStore) {}

  initAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppInit),
        tap(() => {
          this.authStore.init();
        })
      ),
    {
      dispatch: false
    }
  );
}
