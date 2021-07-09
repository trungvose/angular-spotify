import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { RouteUtil, SelectorUtil } from '@angular-spotify/web/shared/utils';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';

@Component({
  selector: 'as-playlist-track',
  templateUrl: './playlist-track.component.html',
  styleUrls: ['./playlist-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistTrackComponent implements OnInit {
  get item(): SpotifyApi.PlaylistTrackObject {
    return this._item;
  }

  @Input()
  set item(value: SpotifyApi.PlaylistTrackObject) {
    this._item = value;
    if (value?.track) {
      this.albumRouteUrl = RouteUtil.getAlbumRouteUrl(value.track.album.id);
    }
  }
  
  private _item!: SpotifyApi.PlaylistTrackObject;

  @Input() index!: number;
  @Input() contextUri!: string | null | undefined;
  @Input() type: 'PLAYLIST' | 'LIKE_SONGS' = 'PLAYLIST';

  isTrackPlaying$!: Observable<boolean>;
  albumRouteUrl?: string;

  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.isTrackPlaying$ = SelectorUtil.getTrackPlayingState(
      combineLatest([of(this._item?.track.id), this.playbackStore.playback$])
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
          position: this.type === 'PLAYLIST' ? this.index : this.item.track.track_number - 1
        }
      })
      .subscribe(); //TODO: Refactor with component store live stream
  }

  getAlbumRouteUrl(album: SpotifyApi.AlbumObjectSimplified) {
    return RouteUtil.getAlbumRouteUrl(album.id);
  }
}
