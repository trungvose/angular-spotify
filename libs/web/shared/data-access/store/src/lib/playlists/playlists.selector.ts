import { createSelector } from '@ngrx/store';
import { RootState } from '../rootState';

//Playlists
export const getPlaylistsState = (state: RootState) => state.playlists;
export const getPlaylists = createSelector(getPlaylistsState, (state) => state.data);
export const getIsPlaylistsLoading = createSelector(
  getPlaylistsState,
  (state) => state.status === 'loading'
);
export const getPlaylistsMap = createSelector(getPlaylistsState, (state) => state.map);
export const getPlaylist = (playlistId: string) =>
  createSelector(getPlaylistsMap, (map) => map?.get(playlistId));
