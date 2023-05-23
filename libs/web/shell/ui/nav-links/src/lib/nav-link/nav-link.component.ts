import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';

@Component({
  selector: 'as-nav-link',
  templateUrl: './nav-link.component.html',
  styleUrls: ['./nav-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavLinkComponent implements OnInit {
  @Input()
  set playlist(value: SpotifyApi.PlaylistObjectSimplified) {
    this.playlistWithRoute = { ...value, routeUrl: RouteUtil.getPlaylistRouteUrl(value.id) };
  }

  playlistWithRoute!: SpotifyApi.PlaylistObjectSimplified & { routeUrl: string };
  isPlaylistPlaying$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isPlaylistPlaying$ = SelectorUtil.getMediaPlayingState(
      combineLatest([of(this.playlistWithRoute?.uri), this.playbackStore.playback$])
    );
  }

  togglePlaylist(isPlaying: boolean) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: this.playlistWithRoute?.uri
      })
      .subscribe(); //TODO: Refactor with component store live stream
  }
}
