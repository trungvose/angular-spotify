import { createAction, props } from '@ngrx/store';

export const loadPlaylists = createAction('[Playlists Store/API]');
export const loadPlaylistsSuccess = createAction(
  '[Playlists Store/API success]',
  props<{
    playlists: SpotifyApi.ListOfUsersPlaylistsResponse;
  }>()
);

export const loadPlaylistsErrors = createAction(
  '[Playlists Store/API error]',
  props<{ error: string }>()
);
