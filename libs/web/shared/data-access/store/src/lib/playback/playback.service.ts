import { SettingsFacade } from '@angular-spotify/web/settings/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { PlaybackStore } from './playback.store';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  constructor(
    private playbackStore: PlaybackStore,
    private playerApi: PlayerApiService,
    private titleService: Title,
    private settingsFacade: SettingsFacade
  ) {
    // Initialize the callback early to prevent errors if SDK loads before initPlaybackSDK is called
    if (typeof window !== 'undefined' && !window.onSpotifyWebPlaybackSDKReady) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        // No-op initially, will be set up properly in waitForSpotifyWebPlaybackSDKToLoad
      };
    }
  }

  play() {
    this.playbackStore.player()?.togglePlay();
  }

  next() {
    this.playbackStore.player()?.nextTrack();
  }

  prev() {
    this.playbackStore.player()?.previousTrack();
  }

  seek(pos_ms: number) {
    this.playbackStore.player()?.seek(pos_ms);
  }

  setVolume(volume: number): Observable<unknown> {
    this.playbackStore.patchState({
      volume
    });
    this.settingsFacade.persistVolume(volume);
    return this.playerApi.setVolume(Math.floor(volume * 100));
  }

  async initPlaybackSDK(token: string, volume: number) {
    const { Player } = await this.waitForSpotifyWebPlaybackSDKToLoad();
    const player = new Player({
      name: 'Angular Spotify Web Player',
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume
    });

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

    player.addListener('player_state_changed', async (state: Spotify.PlaybackState) => {
      console.log(state);
      if (!state) {
        console.info('[Angular Spotify] No player info!');
        return;
      }
      this.setAppTitle(state);
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

    player.addListener('ready', ({ device_id }) => {
      console.log('[Angular Spotify] Ready with Device ID', device_id);
      this.playbackStore.patchState({
        deviceId: device_id
      });
      this.playerApi.transferUserPlayback(device_id).subscribe();
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('[Angular Spotify] Device ID has gone offline', device_id);
    });

    await player.connect();
    this.playbackStore.patchState({
      player
    });
  }

  //TODO: move to an effect somewhere
  setAppTitle(state: Spotify.PlaybackState) {
    const currentTrack = state.track_window?.current_track;
    if (currentTrack) {
      const artistName = currentTrack.artists[0].name || '';
      this.titleService.setTitle(
        `Angular Spotify - ${currentTrack.name} ${artistName ? `- ${artistName}` : ''}`
      );
    }
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
