import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import {
  loadPlaylistTracks,
  loadPlaylistTracksError,
  loadPlaylistTracksSuccess,
  setPlaylistTracksStateStatus
} from './playlist-tracks.action';

export const playlistTrackFeatureKey = 'playlistTracks';
export type PlaylistTracksState = GenericState<Map<string, SpotifyApi.PlaylistTrackResponse>>;

const initialState: PlaylistTracksState = {
  data: new Map(),
  status: 'pending',
  error: null
};

export const playlistTracksReducer = createReducer(
  initialState,
  on(loadPlaylistTracks, (state) => ({ ...state, status: 'loading' as const })),
  on(loadPlaylistTracksSuccess, (state, { playlistId, playlistTracks }) => {
    const { data: map } = state;
    map?.set(playlistId, playlistTracks);
    return { ...state, data: map, status: 'success' as const };
  }),
  on(loadPlaylistTracksError, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const
  })),
  on(setPlaylistTracksStateStatus, (state, { status }) => ({ ...state, status }))
);
