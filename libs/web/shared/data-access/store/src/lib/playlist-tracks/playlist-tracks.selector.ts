import { createSelector } from '@ngrx/store';
import { RootState } from '../rootState';

export const getPlaylistTracksState = (state: RootState) => state.playlistTracks;
export const getPlaylistTracksById = (playlistId: string) =>
  createSelector(getPlaylistTracksState, ({ data }) => {
    return data?.get(playlistId);
  });
