import {
  getPlaylistsLoading,
  getPlaylistsWithRouteUrl
} from '@angular-spotify/web/playlist/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from 'mini-rx-store';

@Component({
  selector: 'as-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistsComponent {
  playlists$ = this.store.select(getPlaylistsWithRouteUrl);
  isPlaylistsLoading$ = this.store.select(getPlaylistsLoading);

  constructor(private store: Store) {}
}
