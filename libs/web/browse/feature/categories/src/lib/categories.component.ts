import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getCategories, getCategoriesLoading, loadCategories } from '@angular-spotify/web/browse/data-access';

@Component({
  selector: 'as-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent {
  isLoading$ = this.store.pipe(select(getCategoriesLoading))
  categories$ = this.store.pipe(select(getCategories));

  constructor(private store: Store) {
    this.store.dispatch(loadCategories({}));
  }
}
