import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterUtil } from '@angular-spotify/web/util';

@Component({
  selector: 'as-track-main-info',
  templateUrl: './track-main-info.component.html',
  styleUrls: ['./track-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackMainInfoComponent {
  @Input() track: SpotifyApi.TrackObjectFull | undefined;

  getArtistUrl(artist: SpotifyApi.ArtistObjectSimplified) {
    return `/${RouterUtil.Configuration.Artist}/${artist.id}`;
  }
}
