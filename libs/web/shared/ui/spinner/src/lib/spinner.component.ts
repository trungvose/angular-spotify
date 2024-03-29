import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {  } from '@ngneat/svg-icon';

@Component({
  selector: 'as-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() size = "xl";
}
