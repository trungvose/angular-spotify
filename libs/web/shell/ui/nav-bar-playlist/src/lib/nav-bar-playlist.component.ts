import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getPlaylists, getPlaylistsLoading } from '@angular-spotify/web/playlist/data-access';
import { Observable } from 'rxjs';
@Component({
  selector: 'as-nav-bar-playlist',
  templateUrl: './nav-bar-playlist.component.html',
  styleUrls: ['./nav-bar-playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarPlaylistComponent implements OnInit {
  playlists$!: Observable<SpotifyApi.ListOfUsersPlaylistsResponse | null>;
  isPlaylistsLoading$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.playlists$ = this.store.pipe(select(getPlaylists));
    this.isPlaylistsLoading$ = this.store.select(getPlaylistsLoading);
  }
}
