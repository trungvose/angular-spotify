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

export const loadPlaylist = createAction(
  '[Playlists Store/Load Playlist By Id]',
  props<{
    playlistId: string;
  }>()
);

export const loadPlaylistSuccess = createAction(
  '[Playlists Store/Load Playlist By Id success]',
  props<{
    playlist: SpotifyApi.PlaylistObjectSimplified;
  }>()
);

export const loadPlaylistError = createAction(
  '[Playlists Store/Load Playlist By Id error]',
  props<{ error: string }>()
);
