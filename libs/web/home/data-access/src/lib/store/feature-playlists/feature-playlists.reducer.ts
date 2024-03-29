import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import {
  loadFeaturedPlaylists,
  loadFeaturedPlaylistsError,
  loadFeaturedPlaylistsSuccess
} from './feature-playlists.action';

export type FeaturePlaylistsState = GenericState<SpotifyApi.ListOfFeaturedPlaylistsResponse>;

const initialState: FeaturePlaylistsState = {
  data: null,
  status: 'pending',
  error: null
};

export const featuredPlaylistsFeatureKey = 'feature-playlists';

export const featuredPlaylistsReducer = createReducer(
  initialState,
  on(loadFeaturedPlaylists, (state) => ({ ...state, status: 'loading' as const })),
  on(loadFeaturedPlaylistsSuccess, (state, { response }) => ({
    ...state,
    data: response,
    status: 'success' as const,
    error: null
  })),
  on(loadFeaturedPlaylistsError, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const
  }))
);
