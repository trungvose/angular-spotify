import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent {}
