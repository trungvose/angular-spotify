import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpotifyTrackExtended } from '@angular-spotify/web/shared/data-access/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MediaCoverComponent } from '@angular-spotify/web/shared/ui/media-cover';

@Component({
  selector: 'as-track-current-info',
  templateUrl: './track-current-info.component.html',
  styleUrls: ['./track-current-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MediaCoverComponent],
})
export class TrackCurrentInfoComponent {
  @Input() track: SpotifyTrackExtended | undefined;
}
