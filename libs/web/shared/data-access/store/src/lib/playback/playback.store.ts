/// <reference types="spotify-web-playback-sdk" />
import { GenericState } from '@angular-spotify/web/shared/data-access/models';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface PlaybackState extends GenericState<Spotify.PlaybackState> {
  player: Spotify.SpotifyPlayer;
  deviceId: string;
  volume: number;
  analysis: SpotifyApi.AudioAnalysisResponse;
  features: SpotifyApi.AudioFeaturesResponse;
}

@Injectable({ providedIn: 'root' })
export class PlaybackStore extends ComponentStore<PlaybackState> {
  readonly playback$ = this.select((s) => s.data).pipe(
    filter((data) => !!data)
  ) as Observable<Spotify.PlaybackState>;

  readonly context$ = this.playback$.pipe(map((data) => data.context));
  readonly currentTrack$ = this.playback$.pipe(map((data) => data?.track_window.current_track));
  readonly isPlaying$ = this.playback$.pipe(
    map((data) => {
      if (!data) {
        return false;
      }
      return !data.paused;
    })
  );
  readonly position$ = this.playback$.pipe(map((data) => data?.position));
  readonly volume$ = this.select((s) => s.volume);
  readonly player = () => this.get().player;

  constructor() {
    super({} as PlaybackState);
  }
}
