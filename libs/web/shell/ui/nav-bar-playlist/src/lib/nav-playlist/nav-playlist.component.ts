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
  isPlaylistPlaying$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isPlaylistPlaying$ = SelectorUtil.getMediaPlayingState(
      combineLatest([of(this.playlist?.uri), this.playbackStore.playback$])
    );
  }

  getPlaylistRouteUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return RouteUtil.getPlaylistRouteUrl(playlist);
  }

  togglePlaylist(isPlaying: boolean) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: this.playlist?.uri
      })
      .subscribe();//TODO: Refactor with component store live stream
  }
}
