import { getPlaylists, getPlaylistsLoading } from '@angular-spotify/web/playlist/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from 'mini-rx-store';
@Component({
  selector: 'as-nav-bar-playlist',
  templateUrl: './nav-bar-playlist.component.html',
  styleUrls: ['./nav-bar-playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarPlaylistComponent {
  playlists$ = this.store.select(getPlaylists);
  isPlaylistsLoading$ = this.store.select(getPlaylistsLoading);

  constructor(private store: Store) {}
}
