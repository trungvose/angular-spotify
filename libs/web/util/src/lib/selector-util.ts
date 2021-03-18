/// <reference types="spotify-web-playback-sdk" />
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export class SelectorUtil {
  static getMediaPauseState(obs$: Observable<[string | undefined, Spotify.PlaybackState]>) {
    return obs$.pipe(
      map(([uri, playback]) => {
        const isCurrentPlaylistInContext = uri === playback.context?.uri;
        if (isCurrentPlaylistInContext) {
          return playback.paused;
        }
        return true;
      }),
      startWith(true)
    );
  }
}
