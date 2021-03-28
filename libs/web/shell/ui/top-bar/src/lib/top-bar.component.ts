import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent {
  constructor(private location: Location) {}

  back() {
    this.location.back();
  }

  forward() {
    this.location.forward();
  }
}
