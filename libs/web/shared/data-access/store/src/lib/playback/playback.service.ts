import { Injectable } from '@angular/core';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { tap } from 'rxjs/operators';
import { PlaybackStore } from './playback.store';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  constructor(
    private authStore: AuthStore,
    private playbackStore: PlaybackStore,
    private playerApi: PlayerApiService
  ) {}

  init() {
    this.authStore.token$
      .pipe(
        tap((token) => {
          this.initPlaybackSDK(token);
        })
      )
      .subscribe();
  }

  play() {
    this.playbackStore.player().togglePlay();
  }

  next() {
    this.playbackStore.player().nextTrack();
  }

  prev() {
    this.playbackStore.player().previousTrack();
  }

  seek(pos_ms: number) {
    this.playbackStore.player().seek(pos_ms);
  }

  setVolume(volume: number) {
    this.playbackStore.player().setVolume(volume);
    this.playbackStore.patchState({
      volume
    });
  }

  private async initPlaybackSDK(token: string) {
    const { Player } = await this.waitForSpotifyWebPlaybackSDKToLoad();
    const player = new Player({
      name: 'Angular Spotify Web Player',
      getOAuthToken: (cb) => {
        cb(token);
      }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => {
      console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
      console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
      alert(`You account has to have Spotify Premium for playing music ${message}`);
    });

    player.addListener('playback_error', ({ message }) => {
      console.error(message);
    });

    // Playback status updates
    player.addListener('player_state_changed', async (state: Spotify.PlaybackState) => {
      console.log(state);
      this.playbackStore.patchState({
        data: state,
        volume: await player.getVolume()
      });
      const currentTrackId = state.track_window?.current_track?.id;
      if (!state.paused && currentTrackId) {
        this.playbackStore.loadTracksAnalytics({
          trackId: currentTrackId
        });
      }
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      this.playbackStore.patchState({
        deviceId: device_id
      });
      this.playerApi.transferUserPlayback(device_id).subscribe();
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect Angular Spotify player!
    await player.connect();
    this.playbackStore.patchState({
      player
    });
  }

  private waitForSpotifyWebPlaybackSDKToLoad(): Promise<typeof Spotify> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.onSpotifyWebPlaybackSDKReady = () => {};

    return new Promise((resolve) => {
      if (window.Spotify) {
        resolve(window.Spotify);
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          resolve(window.Spotify);
        };
      }
    });
  }
}
