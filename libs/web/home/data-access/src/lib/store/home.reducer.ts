import { GenericState, SpotifyApiRecentPlayerTracksResponse } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import { loadRecentTracks, loadRecentTracksError, loadRecentTracksSuccess } from './home.action';

export type State = GenericState<SpotifyApiRecentPlayerTracksResponse>;

export const initialState: State = {
  data: null,
  status: 'pending',
  error: null
};

export const homeFeatureKey = 'home';

export const homeReducer = createReducer(
  initialState,
  on(loadRecentTracks, (state) => ({ ...state, status: 'loading' })),
  on(loadRecentTracksSuccess, (state, { response }) => ({
    ...state,
    data: response,
    status: 'success',
    error: null
  })),
  on(loadRecentTracksError, (state, { error }) => ({
    ...state,
    error,
    status: 'error'
  }))
);
