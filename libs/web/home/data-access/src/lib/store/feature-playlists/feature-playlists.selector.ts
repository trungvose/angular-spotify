import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFeaturedPlaylists from './feature-playlists.reducer';
// eslint-disable-next-line
import { RootState } from '@angular-spotify/web/shared/data-access/store';

export const getFeaturePlaylistsState = createFeatureSelector<
  RootState,
  fromFeaturedPlaylists.FeaturePlaylistsState
>(fromFeaturedPlaylists.featuredPlaylistsFeatureKey);

export const getFeaturedPlaylists = createSelector(getFeaturePlaylistsState, ({ data }) => {
  return data;
});
