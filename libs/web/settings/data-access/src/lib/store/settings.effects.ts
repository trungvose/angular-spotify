import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';

import { LocalStorageService } from '../services';
import * as SettingsActions from './settings.actions';
import { SettingsState } from './settings.reducer';
import { getSettings } from './settings.selectors';

export const SETTINGS_KEY = 'SETTINGS';

@Injectable()
export class SettingsEffects {
  public persistSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SettingsActions.persistVolume),
        withLatestFrom(this.store.pipe(select(getSettings))),
        tap(([, settings]) => LocalStorageService.setItem(SETTINGS_KEY, settings))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<SettingsState>
  ) {}
}
