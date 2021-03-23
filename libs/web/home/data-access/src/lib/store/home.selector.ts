import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromHome from './home.reducer';
// eslint-disable-next-line
import { RootState } from '@angular-spotify/web/shared/data-access/store';

export const getHomeState = createFeatureSelector<RootState, fromHome.State>(
  fromHome.homeFeatureKey
);

export const getRecentPlayedTracks = createSelector(getHomeState, (home) => home.data?.items);
