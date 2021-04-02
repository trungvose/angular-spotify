import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { playlistsFeatureKey, PlaylistsState } from './playlists.reducer';

export const getPlaylistsState = createFeatureSelector<PlaylistsState>(playlistsFeatureKey);
export const getPlaylists = createSelector(getPlaylistsState, (state) => state.data);
export const getPlaylistsWithRouteUrl = createSelector(getPlaylists, (playlists) => {
  if (playlists) {
    return {
      ...playlists,
      items: playlists.items.map((item) => ({
        ...item,
        routeUrl: RouteUtil.getPlaylistRouteUrl(item)
      }))
    };
  }
  return playlists;
});
export const getPlaylistsLoading = createSelector(getPlaylistsState, SelectorUtil.isLoading);
export const getPlaylistsDone = createSelector(getPlaylistsState, SelectorUtil.isDone);
export const getPlaylistsMap = createSelector(getPlaylistsState, (state) => state.map);
export const getPlaylist = (playlistId: string) =>
  createSelector(getPlaylistsMap, (map) => map?.get(playlistId));
