import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featuredPlaylistsFeatureKey, FeaturePlaylistsState } from './feature-playlists.reducer';

export const getFeaturePlaylistsState = createFeatureSelector<FeaturePlaylistsState>(
  featuredPlaylistsFeatureKey
);

export const getFeaturedPlaylists = createSelector(getFeaturePlaylistsState, ({ data }) => {
  return data;
});
