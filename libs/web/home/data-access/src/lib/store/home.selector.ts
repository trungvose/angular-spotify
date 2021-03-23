import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromHome from './home.reducer';
// eslint-disable-next-line
import { RootState } from '@angular-spotify/web/shared/data-access/store';

export const getHomeState = createFeatureSelector<RootState, fromHome.State>(
  fromHome.homeFeatureKey
);

export const getRecentPlayedTracks = createSelector(getHomeState, (home) => {
  if (!home.data) {
    return null;
  }
  return home.data.items
    .filter(({ track }, idx, arr) => arr.findIndex((item) => item.track.id === track.id) === idx)
    .slice(0, 10);
});
