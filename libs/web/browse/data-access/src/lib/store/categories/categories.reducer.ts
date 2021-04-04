import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { createReducer, on } from '@ngrx/store';
import { loadCategories, loadCategoriesSuccess } from './categories.action';
export const categoriesFeatureKey = 'categories';

export type CategoriesState = GenericState<SpotifyApi.MultipleCategoriesResponse>;

const initialState: CategoriesState = {
  data: null,
  status: 'pending',
  error: null
};

export const categoriesReducer = createReducer(
  initialState,
  on(loadCategories, (state) => ({ ...state, status: 'loading' })),
  on(loadCategoriesSuccess, (state, { categories }) => ({ ...state, data: categories }))
);
