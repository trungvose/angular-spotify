import { createSelector } from '@ngrx/store';
import { RootState } from './rootState';

export const getPlaylistsState = (state: RootState) => state.playlists;
export const getPlaylists = createSelector(getPlaylistsState, (state) => state.data);
