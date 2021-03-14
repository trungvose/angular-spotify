import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-now-playing-bar',
  templateUrl: './now-playing-bar.component.html',
  styleUrls: ['./now-playing-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingBarComponent {

}
