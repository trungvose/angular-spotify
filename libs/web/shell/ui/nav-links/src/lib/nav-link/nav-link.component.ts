import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { MediaCoverComponent } from '@angular-spotify/web/shared/ui/media-cover';
import { PlayButtonComponent } from '@angular-spotify/web/shared/ui/play-button';
import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { LetDirective } from '@ngrx/component';

@Component({
  selector: 'as-nav-link',
  templateUrl: './nav-link.component.html',
  styleUrls: ['./nav-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, CommonModule, MediaCoverComponent, PlayButtonComponent, LetDirective],
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
