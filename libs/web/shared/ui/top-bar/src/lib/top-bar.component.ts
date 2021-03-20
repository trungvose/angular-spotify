import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent  {

}
