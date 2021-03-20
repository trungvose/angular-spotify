/// <reference types="spotify-web-playback-sdk" />
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export class SelectorUtil {
  static getMediaPlayingState(obs$: Observable<[string | undefined, Spotify.PlaybackState]>) {
    return obs$.pipe(
      map(([uri, playback]) => {
        const isCurrentPlaylistInContext = uri === playback.context?.uri;
        if (isCurrentPlaylistInContext) {
          return !playback.paused;
        }
        return false;
      }),
      startWith(false)
    );
  }

  static getTrackPlayingState(obs$: Observable<[string | undefined, Spotify.PlaybackState]>) {
    return obs$.pipe(
      map(([trackId, playback]) => {
        const track = playback?.track_window?.current_track;
        if (!trackId || !track) {
          return false;
        }
        if (trackId !== track.id) {
          return false;
        }
        return !playback.paused;
      }),
      startWith(false)
    );
  }
}
