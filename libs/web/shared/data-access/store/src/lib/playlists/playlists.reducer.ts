import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { Action, createReducer, on } from '@ngrx/store';
import { loadPlaylists, loadPlaylistsErrors, loadPlaylistsSuccess } from './playlists.action';

export type State = GenericState<SpotifyApi.ListOfUsersPlaylistsResponse>;

const initialState: State = {
  data: null,
  status: 'pending',
  error: null
};

const playlistsReducer = createReducer(
  initialState,
  on(loadPlaylists, (state) => ({ ...state, status: 'loading' })),
  on(loadPlaylistsSuccess, (state, { playlists }) => ({
    ...state,
    data: playlists,
    status: 'success',
    error: null
  })),
  on(loadPlaylistsErrors, (state, { error }) => ({
    ...state,
    error,
    status: 'error'
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return playlistsReducer(state, action);
}
