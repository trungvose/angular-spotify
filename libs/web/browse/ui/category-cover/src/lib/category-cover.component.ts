import { MediaCoverComponent } from '@angular-spotify/web/shared/ui/media-cover';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'as-category-cover',
  templateUrl: './category-cover.component.html',
  styleUrls: ['./category-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MediaCoverComponent, RouterModule],
})
export class CategoryCoverComponent {
  @Input() category!: SpotifyApi.CategoryObject;
}
