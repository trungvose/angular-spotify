import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  getPlaylists,
  loadPlaylists,
  RootState
} from '@angular-spotify/web/shared/data-access/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'as-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistsComponent implements OnInit {
  playlists$: Observable<SpotifyApi.ListOfUsersPlaylistsResponse | null>;

  constructor(private store: Store<RootState>) {
    this.playlists$ = this.store.pipe(select(getPlaylists));
  }

  ngOnInit(): void {
    this.store.dispatch(loadPlaylists());
  }

  getPlaylistRouterUrl(playlist: SpotifyApi.PlaylistObjectSimplified) {
    return `/playlist/${playlist.id}`;
  }
}
