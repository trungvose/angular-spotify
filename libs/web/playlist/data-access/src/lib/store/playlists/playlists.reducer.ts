import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import {
  loadPlaylists,
  loadPlaylistsError,
  loadPlaylistsSuccess,
  loadPlaylistSuccess
} from './playlists.action';

export const playlistsFeatureKey = 'playlists';

export interface PlaylistsState extends GenericState<SpotifyApi.ListOfUsersPlaylistsResponse> {
  map: Map<string, SpotifyApi.PlaylistObjectSimplified> | null;
}

const initialState: PlaylistsState = {
  map: null,
  data: null,
  status: 'pending',
  error: null
};

export const playlistsReducer = createReducer(
  initialState,
  on(loadPlaylists, (state) => ({ ...state, status: 'loading' as const })),
  on(loadPlaylistsSuccess, (state, { playlists }) => {
    const { items } = playlists;
    const map = new Map<string, SpotifyApi.PlaylistObjectSimplified>();
    items.forEach((playlist) => map.set(playlist.id, playlist));
    return {
      ...state,
      map: map,
      data: playlists,
      status: 'success' as const,
      error: null
    };
  }),
  on(loadPlaylistsError, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const
  })),
  on(loadPlaylistSuccess, (state, { playlist }) => {
    state.map?.set(playlist.id, playlist);
    return {
      ...state,
      map: new Map<string, SpotifyApi.PlaylistObjectSimplified>(state.map!)
    };
  })
);
