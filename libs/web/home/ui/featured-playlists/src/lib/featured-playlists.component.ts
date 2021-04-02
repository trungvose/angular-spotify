import { getFeaturedPlaylistsWithRouteUrl } from '@angular-spotify/web/home/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'as-featured-playlists',
  templateUrl: './featured-playlists.component.html',
  styleUrls: ['./featured-playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedPlaylistsComponent {
  featuredPlaylists$ = this.store.pipe(select(getFeaturedPlaylistsWithRouteUrl));

  constructor(private store: Store, private playerApi: PlayerApiService) {}

  togglePlay(isPlaying: boolean, playlistUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: playlistUri
      })
      .subscribe();
  }
}
