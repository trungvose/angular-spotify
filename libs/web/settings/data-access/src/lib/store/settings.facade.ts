import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { SettingsState } from './settings.reducer';
import * as SettingsActions from './settings.actions';
import * as SettingsSelectors from './settings.selectors';

@Injectable()
export class SettingsFacade {
  public settings$ = this.store.select(SettingsSelectors.getSettings);
  public volume$ = this.store.select(SettingsSelectors.getSettingsVolume);

  constructor(private store: Store<SettingsState>) {}

  public persistVolume(volume: number) {
    this.store.dispatch(SettingsActions.persistVolume({ volume }));
  }
}
