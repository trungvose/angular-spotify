import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { SVG_CONFIG } from '@ngneat/svg-icon/lib/types';

@Component({
  selector: 'as-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() size: keyof SVG_CONFIG['sizes'] = 'xl';
}
