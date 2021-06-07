import { reducer as createReducer, on } from 'ts-action';
import * as SettingsActions from './settings.actions';

export const SETTINGS_FEATURE_KEY = 'settings';

export interface SettingsState {
  volume: number;
}

export const initialState: SettingsState = {
  volume: 0
};

export const settingsReducer = createReducer(
  initialState,
  on(SettingsActions.persistVolume, (state, { volume }) => ({
    ...state,
    volume
  }))
);
