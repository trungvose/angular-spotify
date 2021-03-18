import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { RouteUtil, SelectorUtil } from '@angular-spotify/web/util';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';

@Component({
  selector: 'as-nav-playlist',
  templateUrl: './nav-playlist.component.html',
  styleUrls: ['./nav-playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavPlaylistComponent implements OnInit {
  @Input() playlist!: SpotifyApi.PlaylistObjectSimplified;
  isPlaylistPause$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isPlaylistPause$ = SelectorUtil.getMediaPauseState(
      combineLatest([of(this.playlist?.uri), this.playbackStore.playback$])
    );
  }

  getPlaylistRouteUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return RouteUtil.getPlaylistRouteUrl(playlist);
  }

  togglePlaylist(isPause: boolean) {
    const playbackObs$ = isPause
      ? this.playerApi.play({
          context_uri: this.playlist?.uri
        })
      : this.playerApi.pause();

    playbackObs$.subscribe();
  }
}
