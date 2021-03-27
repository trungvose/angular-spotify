import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracksComponent {}
