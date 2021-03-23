import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import { loadPlaylists, loadPlaylistsError, loadPlaylistsSuccess } from './playlists.action';

export type State = GenericState<SpotifyApi.ListOfUsersPlaylistsResponse>;

const initialState: State = {
  data: null,
  status: 'pending',
  error: null
};

export const playlistsReducer = createReducer(
  initialState,
  on(loadPlaylists, (state) => ({ ...state, status: 'loading' })),
  on(loadPlaylistsSuccess, (state, { playlists }) => ({
    ...state,
    data: playlists,
    status: 'success',
    error: null
  })),
  on(loadPlaylistsError, (state, { error }) => ({
    ...state,
    error,
    status: 'error'
  }))
);
