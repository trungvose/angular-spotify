import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouteUtil } from '@angular-spotify/web/shared/utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MediaCoverComponent } from '@angular-spotify/web/shared/ui/media-cover';

@Component({
  selector: 'as-track-main-info',
  templateUrl: './track-main-info.component.html',
  styleUrls: ['./track-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MediaCoverComponent],
})
export class TrackMainInfoComponent {
  @Input() track: SpotifyApi.TrackObjectFull | undefined;
  @Input() isPlaying!: boolean;
  @Input() isShowArtist = true;

  getArtistRouteUrl(artist: SpotifyApi.ArtistObjectSimplified) {
    return RouteUtil.getArtistRouteUrl(artist.id);
  }
}
