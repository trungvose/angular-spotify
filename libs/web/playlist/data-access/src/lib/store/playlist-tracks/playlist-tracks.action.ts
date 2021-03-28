import { createAction, props } from '@ngrx/store';

export const loadPlaylistTracks = createAction(
  '[Playlist Detail Page/Load]',
  props<{ playlistId: string }>()
);

export const loadPlaylistTracksSuccess = createAction(
  '[Playlist Detail Page/Load Success]',
  props<{ playlistId: string; playlistTracks: SpotifyApi.PlaylistTrackResponse }>()
);

export const loadPlaylistTracksError = createAction(
  '[Playlist Detail Page/Load Error]',
  props<{ error: string }>()
);
