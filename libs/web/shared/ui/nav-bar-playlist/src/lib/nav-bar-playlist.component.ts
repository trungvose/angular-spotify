import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getPlaylists, RootState } from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
import { RouteUtil } from '@angular-spotify/web/util';
@Component({
  selector: 'as-nav-bar-playlist',
  templateUrl: './nav-bar-playlist.component.html',
  styleUrls: ['./nav-bar-playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarPlaylistComponent implements OnInit {
  playlists$!: Observable<SpotifyApi.ListOfUsersPlaylistsResponse | null>;

  constructor(private store: Store<RootState>) {}

  ngOnInit() {
    this.playlists$ = this.store.pipe(select(getPlaylists));
  }

  getPlaylistRouteUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return RouteUtil.getPlaylistRouteUrl(playlist);
  }
}
