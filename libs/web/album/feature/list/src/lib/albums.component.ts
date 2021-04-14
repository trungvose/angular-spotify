import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { getAlbums, getAlbumsLoading, loadAlbums } from '@angular-spotify/web/album/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Store } from 'mini-rx-store';
@Component({
  selector: 'as-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent implements OnInit {
  albums$ = this.store.select(getAlbums);
  isLoading$ = this.store.select(getAlbumsLoading);

  constructor(private store: Store, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.store.dispatch(loadAlbums());
  }

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }
}
