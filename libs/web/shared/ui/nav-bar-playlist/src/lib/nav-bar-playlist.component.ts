import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getPlaylists, RootState } from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';
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
}
