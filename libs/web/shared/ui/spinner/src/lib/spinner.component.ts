import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {  } from '@ngneat/svg-icon';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';

@Component({
  selector: 'as-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SvgIconComponent]
})
export class SpinnerComponent {
  @Input() size = "xl";
}
