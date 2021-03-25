import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-tracks-loading',
  templateUrl: './tracks-loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracksLoadingComponent {
  @Input() avatar = false;
  @Input() title = false;
  @Input() rows = 5;
}
