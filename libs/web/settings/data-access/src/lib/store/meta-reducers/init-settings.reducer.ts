// TODO



// import { ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { LocalStorageService } from '../../services';
import { SettingsState } from '../settings.reducer';
import { Reducer } from 'mini-rx-store';

export function initSettingsFromLocalStorage(
  reducer: Reducer<SettingsState>
): Reducer<SettingsState> {
  return (state, action) => {
    const newState = reducer(state, action);
    // if ([INIT.toString(), UPDATE.toString()].includes(action.type)) {
    //   return { ...newState, ...(LocalStorageService.loadInitialState()?.settings ?? {}) };
    // }
    return newState;
  };
}
