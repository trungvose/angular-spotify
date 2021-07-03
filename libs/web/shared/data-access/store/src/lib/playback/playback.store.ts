/// <reference types="spotify-web-playback-sdk" />
import {
  GenericState,
  SpotifyApiAudioAnalysisResponse,
  SpotifyTrackExtended
} from '@angular-spotify/web/shared/data-access/models';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouteUtil, StringUtil } from '@angular-spotify/web/shared/utils';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

interface PlaybackState extends GenericState<Spotify.PlaybackState> {
  player: Spotify.Player;
  deviceId: string;
  volume: number;
  analysis: SpotifyApiAudioAnalysisResponse;
  trackAnalysisId: string;
  isAnalysisLoading: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlaybackStore extends ComponentStore<PlaybackState> {
  readonly playback$ = this.select((s) => s.data).pipe(
    filter((data) => !!data)
  ) as Observable<Spotify.PlaybackState>;

  readonly context$ = this.playback$.pipe(map((data) => data.context));
  readonly currentTrack$: Observable<SpotifyTrackExtended | null> = this.playback$.pipe(
    filter((data) => !!data),
    map(({ context, track_window }) => {
      const track = track_window.current_track;
      if (!track) {
        return null;
      }
      const { album } = track;
      const getPlaylistUrl = (uri: string | null) => {
        if (!uri) {
          return '';
        }
        const isPlaylist = uri.includes('playlist');
        return isPlaylist ? RouteUtil.getPlaylistRouteUrl(StringUtil.getIdFromUri(uri)) : '';
      };
      const albumId = StringUtil.getIdFromUri(album.uri);
      const albumUrl = RouteUtil.getAlbumRouteUrl(albumId);
      const trackExtended: SpotifyTrackExtended = {
        ...track,
        albumUrl,
        playlistUrl: getPlaylistUrl(context.uri),
        artists: track.artists.map((artist) => {
          const artistId = StringUtil.getIdFromUri(artist.uri);
          const artistUrl = RouteUtil.getArtistRouteUrl(artistId);
          return {
            ...artist,
            artistUrl
          };
        })
      };
      return trackExtended;
    })
  );
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
  readonly analysisInfo$ = this.select((s) => ({
    trackAnalysisId: s.trackAnalysisId,
    isAnalysisLoading: s.isAnalysisLoading
  }));
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
      withLatestFrom(this.analysisInfo$),
      filter(
        ([{ trackId }, { isAnalysisLoading, trackAnalysisId }]) =>
          !isAnalysisLoading && trackId !== trackAnalysisId
      ),
      tap(() => {
        this.patchState({ isAnalysisLoading: true });
      }),
      switchMap(([{ trackId }]) =>
        this.trackApi.getAudioAnalysis(trackId).pipe(
          map((analysis) => ({
            analysis,
            trackId
          })),
          catchError(() => {
            this.patchState({ isAnalysisLoading: false });
            return EMPTY;
          })
        )
      ),
      map(({ analysis, trackId }) => {
        analysis.segments = analysis.segments.map((segment) => ({
          ...segment,
          start: segment.start * 1000,
          duration: segment.duration * 1000
        }));

        this.patchState({
          analysis: analysis,
          trackAnalysisId: trackId,
          isAnalysisLoading: false
        });
      })
    )
  );
}
