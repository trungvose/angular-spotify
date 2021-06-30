import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

@Component({
  selector: 'as-album-track',
  templateUrl: './album-track.component.html',
  styleUrls: ['./album-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumTrackComponent implements OnInit {
  @Input() track!: SpotifyApi.TrackObjectSimplified;
  @Input() contextUri!: string;
  @Input() index?: number;

  isTrackPlaying$!: Observable<boolean>;

  get trackIndex(): number {
    return this.index === undefined ? this.track.track_number : this.index;
  }

  constructor(
    private playbackStore: PlaybackStore, 
    private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isTrackPlaying$ = SelectorUtil.getTrackPlayingState(
      combineLatest([of(this.track.id), this.playbackStore.playback$])
    );
  }

  togglePlayTrack(isPlaying: boolean) {
    if (!this.contextUri) {
      return;
    }

    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: this.contextUri,
        offset: {
          position: this.track.track_number - 1
        }
      })
      .subscribe(); //TODO: Refactor with component store live stream
  }
}
