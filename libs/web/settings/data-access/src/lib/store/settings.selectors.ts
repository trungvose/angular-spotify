import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SETTINGS_FEATURE_KEY, SettingsState } from './settings.reducer';

export const getSettings = createFeatureSelector<SettingsState>(SETTINGS_FEATURE_KEY);

export const getSettingsVolume = createSelector(getSettings, (state) => state.volume || 0);
