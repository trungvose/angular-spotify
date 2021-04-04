import { createFeatureSelector, createSelector } from '@ngrx/store';
import { categoriesFeatureKey, CategoriesState } from './categories.reducer';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';

export const getCategoriesState = createFeatureSelector<CategoriesState>(categoriesFeatureKey);
export const getCategories = createSelector(getCategoriesState, (s) => s.data);
export const getCategoriesMap = createSelector(getCategoriesState, (s) => s.map);
export const getCategoriesLoading = createSelector(getCategoriesState, SelectorUtil.isLoading);
export const getCategoryById = (categoryId: string) =>
  createSelector(getCategoriesMap, (map) => map.get(categoryId));
