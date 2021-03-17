import { select, Store } from '@ngrx/store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, pipe } from 'rxjs';
import {
  getPlaylist,
  getPlaylistTracksById,
  loadPlaylistTracks,
  PlaybackStore,
  RootState
} from '@angular-spotify/web/shared/data-access/store';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
@Component({
  selector: 'as-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent implements OnInit {
  playlist$!: Observable<SpotifyApi.PlaylistObjectSimplified | undefined>;
  tracks$!: Observable<SpotifyApi.PlaylistTrackResponse | undefined>;
  isPlaylistPause$!: Observable<boolean | undefined>;

  constructor(
    private route: ActivatedRoute,
    private store: Store<RootState>,
    private playbackStore: PlaybackStore,
    private playerApi: PlayerApiService
  ) {}

  ngOnInit(): void {
    const playlistParams$ = this.route.params.pipe(
      map((params) => params.playlistId),
      filter((playlistId) => !!playlistId)
    );

    this.playlist$ = playlistParams$.pipe(
      switchMap((playlistId) => this.store.pipe(select(getPlaylist(playlistId))))
    );

    this.isPlaylistPause$ = combineLatest([this.playlist$, this.playbackStore.playback$]).pipe(
      map(([playlist, playback]) => {
        const isCurrentPlaylistInContext = playlist?.uri === playback.context?.uri;
        if (isCurrentPlaylistInContext) {
          return playback.paused;
        }
        return true;
      }),
      startWith(true)
    );

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

  togglePlaylist(isPause: boolean, playlist: SpotifyApi.PlaylistObjectSimplified) {
    const playbackObs$ = isPause
      ? this.playerApi.play({
          context_uri: playlist.uri
        })
      : this.playerApi.pause();

    playbackObs$.subscribe();
  }

  playTrack(playlist: SpotifyApi.PlaylistObjectSimplified, position: number) {
    this.playerApi
      .play({
        context_uri: playlist.uri,
        offset: {
          position
        }
      })
      .subscribe();
  }
}
