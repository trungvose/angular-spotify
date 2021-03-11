import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { Action, createReducer, on } from '@ngrx/store';
import {
  loadPlaylistTracksError,
  loadPlaylistTracks,
  loadPlaylistTracksSuccess
} from './playlist-tracks.action';

export type State = GenericState<Map<string, SpotifyApi.PlaylistTrackResponse>>;

const initialState: State = {
  data: new Map(),
  status: 'pending',
  error: null
};

const playlistTracksReducer = createReducer(
  initialState,
  on(loadPlaylistTracks, (state) => ({ ...state, status: 'loading' })),
  on(loadPlaylistTracksSuccess, (state, { playlistId, playlistTracks }) => {
    const { data: map } = state;
    map?.set(playlistId, playlistTracks);
    return { ...state, data: map };
  }),
  on(loadPlaylistTracksError, (state, { error }) => ({ ...state, error }))
);

export function reducer(state: State | undefined, action: Action) {
  return playlistTracksReducer(state, action);
}
