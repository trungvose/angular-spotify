import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ComponentStore } from '@ngrx/component-store';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { RouterUtil, StringUtil } from '@angular-spotify/web/shared/utils';
import { EMPTY, Observable, combineLatest, interval } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { LrclibApiService } from './lrclib-api.service';
import { LyricsState } from './lyrics.models';

const initialState: LyricsState = {
  lyrics: null,
  isSynced: false,
  isVisible: false,
  isShownAsPiP: false,
  isFirstTime: true,
  status: 'idle',
  currentTrackId: null
};

@Injectable({ providedIn: 'root' })
export class LyricsStore extends ComponentStore<LyricsState> {
  constructor(
    private router: Router,
    private location: Location,
    private playbackStore: PlaybackStore,
    private lrclibApi: LrclibApiService
  ) {
    super(initialState);
    this.showLyricsAsPiP$();
    this.watchTrackChanges$();
  }

  // Selectors
  readonly lyrics$ = this.select((s) => s.lyrics);
  readonly isSynced$ = this.select((s) => s.isSynced);
  readonly isVisible$ = this.select((s) => s.isVisible);
  readonly isShownAsPiP$ = this.select((s) => s.isShownAsPiP);
  readonly status$ = this.select((s) => s.status);
  readonly showPiPLyrics$ = this.select(
    (s) => s.isVisible && s.isShownAsPiP && s.lyrics !== null && s.lyrics.length > 0
  );

  // Interpolated position that ticks every 100ms during playback.
  // The Spotify SDK only reports position on state changes (seek, pause, play),
  // so we estimate current position using the SDK's timestamp to avoid
  // drift caused by async processing delays (e.g. await getVolume()).
  readonly interpolatedPosition$: Observable<number> = combineLatest([
    this.playbackStore.positionWithTimestamp$,
    this.playbackStore.isPlaying$
  ]).pipe(
    switchMap(([{ position, timestamp }, isPlaying]) => {
      if (!isPlaying) {
        return [position];
      }
      return interval(100).pipe(
        startWith(0),
        map(() => position + (Date.now() - timestamp))
      );
    })
  );

  // Active line: find the last lyric line whose time <= current playback position
  readonly activeLine$: Observable<number> = combineLatest([
    this.lyrics$,
    this.isSynced$,
    this.interpolatedPosition$
  ]).pipe(
    map(([lyrics, isSynced, position]) => {
      if (!lyrics || !isSynced || position == null) {
        return -1;
      }
      let activeIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
        const time = lyrics[i].time;
        if (time !== null && time <= position) {
          activeIndex = i;
        }
      }
      return activeIndex;
    }),
    distinctUntilChanged()
  );

  // Effects

  // Mirror VisualizerStore PiP pattern
  private readonly showLyricsAsPiP$ = this.effect(() =>
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e: NavigationEnd) =>
        e.urlAfterRedirects.includes(RouterUtil.Configuration.Lyrics)
      ),
      withLatestFrom(this.state$),
      tap(([isAtLyricsRoute, state]) => {
        if (isAtLyricsRoute) {
          this.setState({ ...state, isFirstTime: false, isVisible: true, isShownAsPiP: false });
        }
        if (!isAtLyricsRoute && !state.isFirstTime) {
          this.setState({ ...state, isVisible: true, isShownAsPiP: true });
        }
      })
    )
  );

  // Watch for track changes and auto-fetch lyrics
  private readonly watchTrackChanges$ = this.effect(() =>
    this.playbackStore.currentTrack$.pipe(
      filter((track): track is NonNullable<typeof track> => !!track),
      map((track) => ({
        trackId: StringUtil.getIdFromUri(track.uri),
        trackName: track.name,
        artistName: track.artists[0]?.name || ''
      })),
      distinctUntilChanged((prev, curr) => prev.trackId === curr.trackId),
      withLatestFrom(this.state$),
      filter(([{ trackId }, state]) => trackId !== state.currentTrackId),
      tap(() => this.patchState({ status: 'loading' })),
      switchMap(([{ trackId, trackName, artistName }]) =>
        this.lrclibApi.getLyrics(trackName, artistName).pipe(
          tap(({ lyrics, isSynced }) => {
            this.patchState({
              lyrics,
              isSynced,
              status: lyrics.length > 0 ? 'loaded' : 'error',
              currentTrackId: trackId
            });
          }),
          catchError(() => {
            this.patchState({ lyrics: null, isSynced: false, status: 'error', currentTrackId: trackId });
            return EMPTY;
          })
        )
      )
    )
  );

  readonly setVisibility = this.effect<{ isVisible: boolean }>((params$) =>
    params$.pipe(
      tap(({ isVisible }) => {
        this.patchState({ isVisible, isShownAsPiP: false, isFirstTime: !isVisible });
      }),
      map(() => this.get() as LyricsState),
      tap((state: LyricsState) => this.handleStateChange(state))
    )
  );

  private handleStateChange({ isVisible, isShownAsPiP }: LyricsState) {
    if (!isVisible) {
      this.patchState({ isFirstTime: true, isShownAsPiP: false, isVisible: false });
    }

    if (isVisible && !isShownAsPiP) {
      this.router.navigate(['/', RouterUtil.Configuration.Lyrics]);
    }

    if ((isVisible && isShownAsPiP) || (!isVisible && !isShownAsPiP)) {
      if (this.location.path().includes(RouterUtil.Configuration.Lyrics)) {
        this.location.back();
      }
    }
  }
}
