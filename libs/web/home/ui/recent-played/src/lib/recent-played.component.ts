import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { RootState } from '@angular-spotify/web/shared/data-access/store';
import { getRecentPlayedTracks } from '@angular-spotify/web/home/data-access';
import { SpotifyApiPlayHistoryObject } from '@angular-spotify/web/shared/data-access/models';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

@Component({
  selector: 'as-recent-played',
  templateUrl: './recent-played.component.html',
  styleUrls: ['./recent-played.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentPlayedComponent implements OnInit {
  recentTracks$!: Observable<SpotifyApiPlayHistoryObject[] | undefined | null>;

  constructor(private store: Store<RootState>, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.recentTracks$ = this.store.pipe(select(getRecentPlayedTracks));
  }

  togglePlayTrack(isPlaying: boolean, trackUri: string) {
    this.playerApi.togglePlay(isPlaying, {
      uris: [trackUri]
    }).subscribe();
  }
}
