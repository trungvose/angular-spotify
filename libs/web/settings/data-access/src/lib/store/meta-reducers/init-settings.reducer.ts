import { LocalStorageService } from '../../services';
import { SETTINGS_FEATURE_KEY, SettingsState } from '../settings.reducer';
import { isMiniRxAction, Reducer } from 'mini-rx-store';

export function initSettingsFromLocalStorage(
  reducer: Reducer<SettingsState>
): Reducer<SettingsState> {
  return (state, action) => {
    const newState = reducer(state, action);
    if (isMiniRxAction(action.type, 'init', SETTINGS_FEATURE_KEY)) {
      return { ...newState, ...(LocalStorageService.loadInitialState()?.settings ?? {}) };
    }
    return newState;
  };
}
