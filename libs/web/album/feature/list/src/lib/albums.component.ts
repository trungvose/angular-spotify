import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getAlbums, getAlbumsLoading, loadAlbums } from '@angular-spotify/web/album/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'as-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MediaModule,
    SpinnerModule,
  ]
})
export class AlbumsComponent implements OnInit {
  albums$ = this.store.pipe(select(getAlbums));
  isLoading$ = this.store.pipe(select(getAlbumsLoading));

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
