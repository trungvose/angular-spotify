import { createAction, props } from '@ngrx/store';

export const loadAlbums = createAction('[Albums Page/API]');

export const loadAlbumsSuccess = createAction(
  '[Albums Page/API success]',
  props<{
    albums: SpotifyApi.UsersSavedAlbumsResponse;
  }>()
);

export const loadAlbumsError = createAction('[Albums Page/API error]', props<{ error: string }>());
