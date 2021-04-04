import { createAction, props } from '@ngrx/store';

export const loadCategories = createAction(
  '[Browse Page]/Load Categories',
  props<Record<string, string>>()
);

export const loadCategoriesSuccess = createAction(
  '[Browse Page/Load Categories Success',
  props<{
    categories: SpotifyApi.MultipleCategoriesResponse;
  }>()
);

// TODO: Skip load error action, to integrate with toApiResponse operator
