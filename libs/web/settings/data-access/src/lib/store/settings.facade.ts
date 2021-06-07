import { Injectable } from '@angular/core';

import * as SettingsActions from './settings.actions';
import * as SettingsSelectors from './settings.selectors';
import { Store } from 'mini-rx-store';

@Injectable()
export class SettingsFacade {
  public settings$ = this.store.select(SettingsSelectors.getSettings);
  public volume$ = this.store.select(SettingsSelectors.getSettingsVolume);

  constructor(private store: Store) {}

  public persistVolume(volume: number) {
    this.store.dispatch(SettingsActions.persistVolume({ volume }));
  }
}
