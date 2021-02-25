import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeftNavComponent {}
