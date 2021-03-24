import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { RootState } from '@angular-spotify/web/shared/data-access/store';
import { getFeaturedPlaylists } from '@angular-spotify/web/home/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouteUtil } from '@angular-spotify/web/util';

@Component({
  selector: 'as-featured-playlists',
  templateUrl: './featured-playlists.component.html',
  styleUrls: ['./featured-playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedPlaylistsComponent implements OnInit {
  featuredPlaylists$!: Observable<SpotifyApi.ListOfFeaturedPlaylistsResponse | null>;

  constructor(private store: Store<RootState>, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.featuredPlaylists$ = this.store.pipe(select(getFeaturedPlaylists));
  }

  togglePlay(isPlaying: boolean, playlistUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: playlistUri
      })
      .subscribe();
  }

  getPlaylistRouteUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return RouteUtil.getPlaylistRouteUrl(playlist);
  }
}
