import { select, Store } from '@ngrx/store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  getPlaylistTracksById,
  loadPlaylistTracks,
  RootState
} from '@angular-spotify/web/shared/data-access/store';
import { switchMap, tap } from 'rxjs/operators';
@Component({
  selector: 'as-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent implements OnInit {
  playlist$!: Observable<SpotifyApi.PlaylistTrackResponse | undefined>;

  constructor(private route: ActivatedRoute, private store: Store<RootState>) {}

  ngOnInit(): void {
    this.playlist$ = this.route.params.pipe(
      tap((params) => {
        const { playlistId } = params;
        if (playlistId) {
          this.store.dispatch(
            loadPlaylistTracks({
              playlistId
            })
          );
        }
      }),
      switchMap((params) => this.store.pipe(select(getPlaylistTracksById(params.playlistId))))
    );
  }
}
