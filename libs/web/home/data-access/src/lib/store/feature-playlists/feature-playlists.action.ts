import { createAction, props } from '@ngrx/store';

export const loadFeaturedPlaylists = createAction('[Home/Load Featured Playlists]');
export const loadFeaturedPlaylistsSuccess = createAction(
  '[Home/Load Featured Playlists Success]',
  props<{
    response: SpotifyApi.ListOfFeaturedPlaylistsResponse;
  }>()
);
export const loadFeaturedPlaylistsError = createAction(
  '[Home/Load Featured Playlists Error]',
  props<{ error: string }>()
);
