import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  getRecentPlayedTracks,
  getRecentPlayedTracksLoading
} from '@angular-spotify/web/home/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouteUtil } from '@angular-spotify/web/shared/utils';

@Component({
  selector: 'as-recent-played',
  templateUrl: './recent-played.component.html',
  styleUrls: ['./recent-played.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentPlayedComponent {
  recentTracks$ = this.store.pipe(select(getRecentPlayedTracks));
  isLoading$ = this.store.pipe(select(getRecentPlayedTracksLoading));

  constructor(private store: Store, private playerApi: PlayerApiService) {}

  togglePlayTrack(isPlaying: boolean, trackUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        uris: [trackUri]
      })
      .subscribe();
  }

  getAlbumUrl(albumId: string){
    return RouteUtil.getAlbumRouteUrl(albumId)
  }
}
