import { createAction, props } from '@ngrx/store';

export const loadPlaylists = createAction('[Playlists Store/API]');

export const loadPlaylistsSuccess = createAction(
  '[Playlists Store/API success]',
  props<{
    playlists: SpotifyApi.ListOfUsersPlaylistsResponse;
  }>()
);

export const loadPlaylistsError = createAction(
  '[Playlists Store/API error]',
  props<{ error: string }>()
);

export const loadPlaylistSuccess = createAction(
  '[Playlists Store/Load Playlist By Id success]',
  props<{
    playlist: SpotifyApi.PlaylistObjectSimplified;
  }>()
);
