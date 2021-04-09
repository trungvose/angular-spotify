import {
  GenericStoreStatus,
  SpotifyApiParams
} from '@angular-spotify/web/shared/data-access/models';
import { createAction, props } from '@ngrx/store';

export const loadCategories = createAction(
  '[Browse Page]/Load Categories',
  props<SpotifyApiParams>()
);

export const loadCategoriesSuccess = createAction(
  '[Browse Page/Load Categories Success',
  props<{
    categories: SpotifyApi.PagingObject<SpotifyApi.CategoryObject>;
  }>()
);

export const setCategoriesState = createAction(
  '[Browse Page/Set Categories state status',
  props<{
    status: GenericStoreStatus;
  }>()
);
// TODO: Skip load error action, to integrate with toApiResponse operator
