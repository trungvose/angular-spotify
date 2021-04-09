import { GenericStoreStatus, SpotifyApiParams } from '@angular-spotify/web/shared/data-access/models';
import { createAction, props } from '@ngrx/store';

export const loadCategoryPlaylists = createAction(
  '[Browse Page]/Load Category Playlist',
  props<{
    categoryId: string;
    params?: SpotifyApiParams;
  }>()
);

export const loadCategoryPlaylistsSuccess = createAction(
  '[Browse Page/Load Category Playlist Success',
  props<{
    categoryId: string;
    playlists: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>;
  }>()
);

export const setCategoryPlaylistsState = createAction(
  '[Browse Page/Set Category Playlist state status',
  props<{
    status: GenericStoreStatus;
  }>()
);

// TODO: Skip load error action, to integrate with toApiResponse operator
