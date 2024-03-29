import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import { loadAlbums, loadAlbumsError, loadAlbumsSuccess } from './albums.action';

// eslint-disable-next-line
export interface AlbumsState extends GenericState<SpotifyApi.UsersSavedAlbumsResponse> {}

const initialState: AlbumsState = {
  data: null,
  error: null,
  status: 'pending'
};

export const albumsFeatureKey = 'albums';

export const albumsReducer = createReducer(
  initialState,
  on(loadAlbums, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null
  })),
  on(loadAlbumsSuccess, (state, { albums }) => ({
    ...state,
    data: albums,
    status: 'success' as const,
    error: null
  })),
  on(loadAlbumsError, (state, { error }) => ({
    ...state,
    status: 'error' as const,
    error
  }))
);
