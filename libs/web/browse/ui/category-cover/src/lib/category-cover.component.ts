import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-category-cover',
  templateUrl: './category-cover.component.html',
  styleUrls: ['./category-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryCoverComponent {
  @Input() category!: SpotifyApi.CategoryObject;
}
