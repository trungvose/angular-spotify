import { createFeatureSelector, createSelector } from '@ngrx/store';
import { categoriesFeatureKey, CategoriesState } from './categories.reducer';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';

export const getCategoriesState = createFeatureSelector<CategoriesState>(categoriesFeatureKey);
export const getCategories = createSelector(getCategoriesState, (s) => s.data?.categories);
export const getCategoriesLoading = createSelector(getCategoriesState, SelectorUtil.isLoading);
