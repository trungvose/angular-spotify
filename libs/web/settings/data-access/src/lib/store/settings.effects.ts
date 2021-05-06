import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { tap, withLatestFrom } from 'rxjs/operators';

import { LocalStorageService } from '../services';
import * as SettingsActions from './settings.actions';
import { getSettings } from './settings.selectors';
import { SettingsState } from './settings.reducer';

export const SETTINGS_KEY = 'SETTINGS';

@Injectable()
export class SettingsEffects {
  public persistSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SettingsActions.persistVolume),
        withLatestFrom(this.store.pipe(select(getSettings))),
        tap(([, settings]) => this.localStorageService.setItem(SETTINGS_KEY, settings))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<SettingsState>,
    private localStorageService: LocalStorageService
  ) {}
}
