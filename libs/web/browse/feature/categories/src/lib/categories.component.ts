import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getCategories, getCategoriesLoading, loadCategories } from '@angular-spotify/web/browse/data-access';
import { Store } from 'mini-rx-store';

@Component({
  selector: 'as-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent {
  isLoading$ = this.store.select(getCategoriesLoading)
  categories$ = this.store.select(getCategories);

  constructor(private store: Store) {
    this.store.dispatch(loadCategories({}));
  }
}
