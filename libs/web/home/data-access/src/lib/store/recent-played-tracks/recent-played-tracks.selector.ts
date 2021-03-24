import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRecentPlayedTracks from './recent-played-tracks.reducer';
// eslint-disable-next-line
import { RootState } from '@angular-spotify/web/shared/data-access/store';

export const getRecentPlayedTracksState = createFeatureSelector<
  RootState,
  fromRecentPlayedTracks.RecentPlayedTracksState
>(fromRecentPlayedTracks.recentFeatureTracksFeatureKey);

export const getRecentPlayedTracks = createSelector(getRecentPlayedTracksState, ({ data }) => {
  if (!data) {
    return null;
  }
  return data.items
    .filter(({ track }, idx, arr) => arr.findIndex((item) => item.track.id === track.id) === idx)
    .slice(0, 20);
});
