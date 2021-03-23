import { createAction, props } from '@ngrx/store';

export const loadRecentTracks = createAction('[Home/Load Recent Played Tracks]');
export const loadRecentTracksSuccess = createAction(
  '[Home/Load Recent Played Tracks Success]',
  props<{
    response: SpotifyApi.UsersRecentlyPlayedTracksResponse;
  }>()
);
export const loadRecentTracksError = createAction(
  '[Home/Load Recent Played Tracks Error]',
  props<{ error: string }>()
);
