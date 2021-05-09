import { ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { LocalStorageService } from '../../services';
import { SettingsState } from '../settings.reducer';

export function initSettingsFromLocalStorage(
  reducer: ActionReducer<SettingsState>
): ActionReducer<SettingsState> {
  return (state, action) => {
    const newState = reducer(state, action);
    if ([INIT.toString(), UPDATE.toString()].includes(action.type)) {
      return { ...newState, ...(LocalStorageService.loadInitialState()?.settings ?? {}) };
    }
    return newState;
  };
}
