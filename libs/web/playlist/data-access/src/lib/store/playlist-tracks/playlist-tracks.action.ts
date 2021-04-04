import { GenericStoreStatus } from '@angular-spotify/web/shared/data-access/models';
import { createAction, props } from '@ngrx/store';

export const loadPlaylistTracks = createAction(
  '[Playlist Tracks/Load]',
  props<{ playlistId: string }>()
);

export const loadPlaylistTracksSuccess = createAction(
  '[Playlist Tracks/Load Success]',
  props<{ playlistId: string; playlistTracks: SpotifyApi.PlaylistTrackResponse }>()
);

export const loadPlaylistTracksError = createAction(
  '[Playlist Tracks/Load Error]',
  props<{ error: string }>()
);

export const setPlaylistTracksStateStatus = createAction(
  '[Playlist Tracks/Set Playlist Tracks Status]',
  props<{ status: GenericStoreStatus }>()
);
