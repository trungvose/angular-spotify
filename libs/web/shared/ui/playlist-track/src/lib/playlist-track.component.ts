import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { SelectorUtil } from '@angular-spotify/web/util';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
@Component({
  selector: 'as-playlist-track',
  templateUrl: './playlist-track.component.html',
  styleUrls: ['./playlist-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistTrackComponent implements OnInit {
  @Input() index!: number;
  @Input() contextUri!: string;
  @Input() item: SpotifyApi.PlaylistTrackObject | undefined;
  isTrackPlaying$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isTrackPlaying$ = SelectorUtil.getTrackPlayingState(
      combineLatest([of(this.item?.track.id), this.playbackStore.playback$])
    );
  }

  togglePlayTrack(isPlaying: boolean) {
    this.playerApi.togglePlay(isPlaying, {
      context_uri: this.contextUri,
      offset: {
        position: this.index
      }
    }).subscribe();
  }
}
