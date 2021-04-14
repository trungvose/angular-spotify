import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { reducer as createReducer, on } from 'ts-action';
import { loadCategories, loadCategoriesSuccess, setCategoriesState } from './categories.action';
export const categoriesFeatureKey = 'categories';

export interface CategoriesState
  extends GenericState<SpotifyApi.PagingObject<SpotifyApi.CategoryObject>> {
  map: Map<string, SpotifyApi.CategoryObject>;
}

const initialState: CategoriesState = {
  data: null,
  status: 'pending',
  error: null,
  map: new Map()
};

export const categoriesReducer = createReducer<CategoriesState>(
  initialState,
  on(loadCategories, (state) => ({ ...state, status: 'loading' })),
  on(loadCategoriesSuccess, (state, { categories }) => {
    const { map } = state;
    categories.items.forEach((category) => {
      map.set(category.id, category);
    });
    return {
      ...state,
      status: 'success',
      data: categories,
      map: new Map(map)
    };
  }),
  on(setCategoriesState, (state, { status }) => ({ ...state, status }))
);
