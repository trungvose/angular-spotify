import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-category-detail',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComponent {
}
