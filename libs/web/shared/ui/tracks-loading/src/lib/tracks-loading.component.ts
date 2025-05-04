import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';
@Component({
  selector: 'as-tracks-loading',
  templateUrl: './tracks-loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SkeletonComponent]
})
export class TracksLoadingComponent {
  skeletonRows: number[] = Array.from({ length: 5 });
  @Input() avatar = false;
  @Input() set rows(value: number) {
    this.skeletonRows = Array.from({ length: value });
  }
}
