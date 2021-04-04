import {
  getPlaylistsLoading,
  getPlaylistsWithRouteUrl
} from '@angular-spotify/web/playlist/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'as-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistsComponent {
  playlists$ = this.store.pipe(select(getPlaylistsWithRouteUrl));
  isPlaylistsLoading$ = this.store.pipe(select(getPlaylistsLoading));

  constructor(private store: Store) {}
}
