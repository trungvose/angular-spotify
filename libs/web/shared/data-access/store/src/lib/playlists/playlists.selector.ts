import { createSelector } from '@ngrx/store';
import { RootState } from '../rootState';
import { SelectorUtil } from '@angular-spotify/web/util';
//Playlists
export const getPlaylistsState = (state: RootState) => state.playlists;
export const getPlaylists = createSelector(getPlaylistsState, (state) => state.data);
export const getPlaylistsLoading = createSelector(getPlaylistsState, SelectorUtil.isLoading);
export const getPlaylistsDone = createSelector(getPlaylistsState, SelectorUtil.isDone);
export const getPlaylistsMap = createSelector(getPlaylistsState, (state) => state.map);
export const getPlaylist = (playlistId: string) =>
  createSelector(getPlaylistsMap, (map) => map?.get(playlistId));
