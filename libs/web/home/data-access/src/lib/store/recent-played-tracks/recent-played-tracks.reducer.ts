import { GenericState, SpotifyApiRecentPlayerTracksResponse } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import { loadRecentTracks, loadRecentTracksError, loadRecentTracksSuccess } from './recent-played-tracks.action';

export type RecentPlayedTracksState = GenericState<SpotifyApiRecentPlayerTracksResponse>;

const initialState: RecentPlayedTracksState = {
  data: null,
  status: 'pending',
  error: null
};

export const recentFeatureTracksFeatureKey = 'recentTracks';

export const recentPlayedTracksReducer = createReducer(
  initialState,
  on(loadRecentTracks, (state) => ({ ...state, status: 'loading' as const })),
  on(loadRecentTracksSuccess, (state, { response }) => ({
    ...state,
    data: response,
    status: 'success' as const,
    error: null
  })),
  on(loadRecentTracksError, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const
  }))
);
