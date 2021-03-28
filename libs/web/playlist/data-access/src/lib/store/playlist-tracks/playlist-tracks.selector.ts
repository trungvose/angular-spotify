import { SelectorUtil } from '@angular-spotify/web/util';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { playlistTrackFeatureKey, PlaylistTracksState } from './playlist-tracks.reducer';

export const getPlaylistTracksState = createFeatureSelector<PlaylistTracksState>(
  playlistTrackFeatureKey
);

export const getPlaylistTracksLoading = createSelector(
  getPlaylistTracksState,
  SelectorUtil.isLoading
);

export const getPlaylistTracksDone = createSelector(getPlaylistTracksState, SelectorUtil.isDone);

export const getPlaylistTracksById = (playlistId: string) =>
  createSelector(getPlaylistTracksState, ({ data }) => {
    return data?.get(playlistId);
  });
