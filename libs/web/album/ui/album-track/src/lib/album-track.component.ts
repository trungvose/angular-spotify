import { Component, OnInit, ChangeDetectionStrategy, Input, signal, computed } from '@angular/core';
import { combineLatest, of } from 'rxjs';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { CommonModule } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { MediaOrderComponent } from '@angular-spotify/web/shared/ui/media-order';
import { TrackMainInfoComponent } from '@angular-spotify/web/shared/ui/track-main-info';

@Component({
  selector: 'as-album-track',
  templateUrl: './album-track.component.html',
  styleUrls: ['./album-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MediaTableModule,
    MediaOrderComponent,
    TrackMainInfoComponent,
    DurationPipeModule,
    LetDirective,
  ],
})
export class AlbumTrackComponent implements OnInit {
  @Input() track!: SpotifyApi.TrackObjectSimplified;
  @Input() contextUri!: string;
  @Input() index?: number;

  // Signals
  playback$ = signal(this.playbackStore.playback$); // Wrap the playback observable in a signal
  isTrackPlaying = computed(() =>
    SelectorUtil.getTrackPlayingState(
      combineLatest([of(this.track.id), this.playback$()])
    )
  );

  get trackIndex(): number {
    return this.index === undefined ? this.track.track_number : this.index;
  }

  constructor(
    private playbackStore: PlaybackStore,
    private playerApi: PlayerApiService
  ) {}

  ngOnInit(): void {
    // No need for additional setup since signals are reactive by default
  }

  togglePlayTrack(isPlaying: boolean) {
    if (!this.contextUri) {
      return;
    }

    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: this.contextUri,
        offset: {
          position: this.track.track_number - 1,
        },
      })
      .subscribe(); // TODO: Refactor with component store live stream
  }
}