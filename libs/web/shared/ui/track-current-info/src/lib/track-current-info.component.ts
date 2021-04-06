import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpotifyTrackExtended } from '@angular-spotify/web/shared/data-access/models';

@Component({
  selector: 'as-track-current-info',
  templateUrl: './track-current-info.component.html',
  styleUrls: ['./track-current-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackCurrentInfoComponent {
  @Input() track: SpotifyTrackExtended | undefined;
}
