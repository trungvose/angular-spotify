/// <reference types="spotify-web-playback-sdk" />
import {
  GenericState,
  SpotifyApiAudioAnalysisResponse
} from '@angular-spotify/web/shared/data-access/models';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
interface PlaybackState extends GenericState<Spotify.PlaybackState> {
  player: Spotify.SpotifyPlayer;
  deviceId: string;
  volume: number;
  analysis: SpotifyApiAudioAnalysisResponse;
}

@Injectable({ providedIn: 'root' })
export class PlaybackStore extends ComponentStore<PlaybackState> {
  readonly playback$ = this.select((s) => s.data).pipe(
    filter((data) => !!data)
  ) as Observable<Spotify.PlaybackState>;

  readonly context$ = this.playback$.pipe(map((data) => data.context));
  readonly currentTrack$ = this.playback$.pipe(map((data) => data?.track_window.current_track));
  readonly position$ = this.playback$.pipe(map((data) => data?.position));
  readonly volume$ = this.select((s) => s.volume);
  readonly isPlaying$ = this.playback$.pipe(
    map((data) => {
      if (!data) {
        return false;
      }
      return !data.paused;
    })
  );
  readonly segments$ = this.select((s) => ({
    isPlaying: s.data ? !s.data.paused : false,
    position: s.data?.position,
    segments: s.analysis?.segments
  })).pipe(filter((s) => !!s.segments));

  readonly player = () => this.get().player;

  constructor(private trackApi: TrackApiService) {
    super({} as PlaybackState);
  }

  readonly loadTracksAnalytics = this.effect<{ trackId: string }>((params$) =>
    params$.pipe(
      switchMap(({ trackId }) => this.trackApi.getAudioAnalysis(trackId)),
      map((analysis) => {
        analysis.segments = analysis.segments.map((segment) => ({
          ...segment,
          start: segment.start * 1000,
          duration: segment.duration * 1000
        }));

        this.patchState({
          analysis: analysis
        });
      })
    )
  );
}
