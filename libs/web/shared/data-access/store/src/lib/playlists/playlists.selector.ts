import { createSelector } from '@ngrx/store';
import { RootState } from '../rootState';

//Playlists
export const getPlaylistsState = (state: RootState) => state.playlists;
export const getPlaylists = createSelector(getPlaylistsState, (state) => state.data);
export const getPlaylist = (playlistId: string) =>
  createSelector(getPlaylists, (playlists) =>
    playlists?.items?.find(({ id }) => playlistId === id)
  );
