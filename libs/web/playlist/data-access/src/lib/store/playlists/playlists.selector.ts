import { SelectorUtil } from '@angular-spotify/web/shared/utils';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { playlistsFeatureKey, PlaylistsState } from './playlists.reducer';

export const getPlaylistsState = createFeatureSelector<PlaylistsState>(playlistsFeatureKey);
export const getPlaylists = createSelector(getPlaylistsState, (state) => state.data);
export const getPlaylistsWithRouteUrl = createSelector(
  getPlaylists,
  SelectorUtil.getPlaylistsWithRoute
);
export const getPlaylistsLoading = createSelector(getPlaylistsState, SelectorUtil.isLoading);
export const getPlaylistsMap = createSelector(getPlaylistsState, (state) => state.map);
export const getPlaylist = (playlistId: string) =>
  createSelector(getPlaylistsMap, (map) => map?.get(playlistId));
