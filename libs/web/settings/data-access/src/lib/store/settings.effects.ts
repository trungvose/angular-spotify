import { Injectable } from '@angular/core';
import { Actions, Store } from 'mini-rx-store';
import { ofType } from 'ts-action-operators';
import { tap, withLatestFrom } from 'rxjs/operators';

import { LocalStorageService } from '../services';
import * as SettingsActions from './settings.actions';
import { getSettings } from './settings.selectors';

export const SETTINGS_KEY = 'SETTINGS';

@Injectable({providedIn: 'root'})
export class SettingsEffects {

  constructor(
    private actions$: Actions,
    private store: Store,
    private localStorageService: LocalStorageService
  ) {
    this.actions$.pipe(
      ofType(SettingsActions.persistVolume),
      withLatestFrom(this.store.select(getSettings)),
      tap(([, settings]) => this.localStorageService.setItem(SETTINGS_KEY, settings))
    ).subscribe();
  }
}
