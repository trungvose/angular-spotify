import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouteUtil } from '@angular-spotify/web/shared/utils';

@Component({
  selector: 'as-track-main-info',
  templateUrl: './track-main-info.component.html',
  styleUrls: ['./track-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackMainInfoComponent {
  @Input() track: SpotifyApi.TrackObjectFull | undefined;
  @Input() isPlaying!: boolean;
  @Input() isShowArtist = true;

  getArtistRouteUrl(artist: SpotifyApi.ArtistObjectSimplified) {
    return RouteUtil.getArtistRouteUrl(artist.id);
  }
}
