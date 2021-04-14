import {
  getCategoryById,
  getCategoryPlaylistsById,
  getCategoryPlaylistsLoading,
  loadCategoryPlaylists
} from '@angular-spotify/web/browse/data-access';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Store } from 'mini-rx-store';

@Component({
  selector: 'as-category-detail',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComponent {
  categoryParams$: Observable<string> = this.route.params.pipe(
    map((params) => params[RouterUtil.Configuration.CategoryId]),
    filter((categoryId) => !!categoryId)
  );

  category$ = this.categoryParams$.pipe(
    switchMap((categoryId) => this.store.select(getCategoryById(categoryId)))
  );

  // TODO: find out why it is always false
  isLoadingPlaylists$ = this.store.select(getCategoryPlaylistsLoading);

  playlists$ = this.categoryParams$.pipe(
    tap((categoryId) => {
      this.store.dispatch(loadCategoryPlaylists({ categoryId }));
    }),
    switchMap((categoryId) => this.store.select(getCategoryPlaylistsById(categoryId)))
  );

  constructor(private route: ActivatedRoute, private store: Store) {}
}
