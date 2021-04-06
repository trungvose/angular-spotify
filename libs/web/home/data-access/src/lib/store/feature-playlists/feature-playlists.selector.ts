import { RouteUtil } from '@angular-spotify/web/shared/utils';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featuredPlaylistsFeatureKey, FeaturePlaylistsState } from './feature-playlists.reducer';

export const getFeaturePlaylistsState = createFeatureSelector<FeaturePlaylistsState>(
  featuredPlaylistsFeatureKey
);

export const getFeaturedPlaylists = createSelector(getFeaturePlaylistsState, ({ data }) => {
  return data;
});

export const getFeaturedPlaylistsWithRouteUrl = createSelector(
  getFeaturedPlaylists,
  (featuredPlaylists) => {
    if (featuredPlaylists) {
      return {
        ...featuredPlaylists,
        playlists: {
          ...featuredPlaylists.playlists,
          items: featuredPlaylists.playlists.items.map((item) => ({
            ...item,
            routeUrl: RouteUtil.getPlaylistRouteUrl(item.id)
          }))
        }
      };
    }

    return featuredPlaylists;
  }
);
