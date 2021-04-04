import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import {
  loadCategoryPlaylists,
  loadCategoryPlaylistsSuccess,
  setCategoryPlaylistsState
} from './category-playlists.action';

export const categoryPlaylistsFeatureKey = 'categoryPlaylists';

export type CategoryPlaylistsState = GenericState<
  Map<string, SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>>
>;

const initialState: CategoryPlaylistsState = {
  status: 'pending',
  data: new Map(),
  error: null
};

export const categoryPlaylistsReducer = createReducer(
  initialState,
  on(loadCategoryPlaylists, (state) => ({
    ...state,
    status: 'loading'
  })),
  on(loadCategoryPlaylistsSuccess, (state, { categoryId, playlists }) => {
    const { data: map } = state;
    map?.set(categoryId, playlists);
    return {
      ...state,
      data: new Map(map!),
      status: 'success'
    };
  }),
  on(setCategoryPlaylistsState, (state, { status }) => ({ ...state, status }))
);
