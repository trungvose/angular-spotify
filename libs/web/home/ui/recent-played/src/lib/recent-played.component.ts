import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  getRecentPlayedTracks,
  getRecentPlayedTracksLoading
} from '@angular-spotify/web/home/data-access';
import { SpotifyApiPlayHistoryObject } from '@angular-spotify/web/shared/data-access/models';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouteUtil } from '@angular-spotify/web/shared/utils';

@Component({
  selector: 'as-recent-played',
  templateUrl: './recent-played.component.html',
  styleUrls: ['./recent-played.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentPlayedComponent implements OnInit {
  recentTracks$!: Observable<SpotifyApiPlayHistoryObject[] | undefined | null>;
  isLoading$!: Observable<boolean>;
  constructor(private store: Store, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.recentTracks$ = this.store.pipe(select(getRecentPlayedTracks));
    this.isLoading$ = this.store.pipe(select(getRecentPlayedTracksLoading));
  }

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
