import { select, Store } from '@ngrx/store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  getPlaylist,
  getPlaylistTracksById,
  loadPlaylistTracks,
  RootState
} from '@angular-spotify/web/shared/data-access/store';
import { filter, map, switchMap, tap } from 'rxjs/operators';
@Component({
  selector: 'as-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent implements OnInit {
  playlist$!: Observable<SpotifyApi.PlaylistObjectSimplified | undefined>;
  tracks$!: Observable<SpotifyApi.PlaylistTrackResponse | undefined>;

  constructor(private route: ActivatedRoute, private store: Store<RootState>) {}

  ngOnInit(): void {
    const playlistParams$ = this.route.params.pipe(
      map((params) => params.playlistId),
      filter((playlistId) => !!playlistId)
    );

    this.playlist$ = playlistParams$.pipe(
      switchMap(playlistId => this.store.pipe(select(getPlaylist(playlistId))))
    )

    this.tracks$ = playlistParams$.pipe(
      tap((playlistId) => {
        this.store.dispatch(
          loadPlaylistTracks({
            playlistId
          })
        );
      }),
      switchMap((playlistId) => this.store.pipe(select(getPlaylistTracksById(playlistId))))
    );
  }
}
