import { SelectorUtil } from '@angular-spotify/web/util';
import { createSelector } from '@ngrx/store';
import { RootState } from '../rootState';

export const getPlaylistTracksState = (state: RootState) => state.playlistTracks;
export const getPlaylistTracksLoading = createSelector(
  getPlaylistTracksState,
  SelectorUtil.isLoading
);

export const getPlaylistTracksDone = createSelector(getPlaylistTracksState, SelectorUtil.isDone);

export const getPlaylistTracksById = (playlistId: string) =>
  createSelector(getPlaylistTracksState, ({ data }) => {
    return data?.get(playlistId);
  });
