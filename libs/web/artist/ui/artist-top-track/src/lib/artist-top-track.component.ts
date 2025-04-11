import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { CommonModule } from '@angular/common';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { MediaOrderComponent } from '@angular-spotify/web/shared/ui/media-order';
import { TrackMainInfoComponent } from '@angular-spotify/web/shared/ui/track-main-info';
import { DurationPipeModule } from '@angular-spotify/web/shared/pipes/duration-pipe';
import { RouterModule } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';


@Component({
  selector: 'as-artist-top-track',
  templateUrl: './artist-top-track.component.html',
  styleUrls: ['./artist-top-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      CommonModule,
      MediaTableModule,
      MediaOrderComponent,
      TrackMainInfoComponent,
      DurationPipeModule,
      LetDirective, PushPipe,
      RouterModule
    ],
})
export class ArtistTopTrackComponent implements OnInit {
  albumRouteUrl!: string;
  isTrackPlaying$!: Observable<boolean>;
  
  @Input() order!: number;   
  private _track!: SpotifyApi.TrackObjectFull;
  get track(): SpotifyApi.TrackObjectFull {
    return this._track;
  }

  @Input()
  set track(value: SpotifyApi.TrackObjectFull) {
    this._track = value;
    if (value) {
      this.albumRouteUrl = RouteUtil.getAlbumRouteUrl(value.album.id);
    }
  }  
  
  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isTrackPlaying$ = SelectorUtil.getTrackPlayingState(
      combineLatest([of(this.track?.id), this.playbackStore.playback$])
    );
  }

  togglePlayTrack(isPlaying: boolean) {
    if (!this.track?.uri) {
      return;
    }

    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: this.track.album.uri,
        offset: {
          position: (this.track.track_number - 1) || 0
        }
      })
      .subscribe(); //TODO: Refactor with component store live stream
  }
}
