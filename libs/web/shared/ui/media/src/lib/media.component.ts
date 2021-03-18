import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { combineLatest, Observable, of } from 'rxjs';
import { SelectorUtil } from '@angular-spotify/web/util';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
@Component({
  selector: 'as-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaComponent implements OnInit {
  @Input() imageUrl!: string;
  @Input() title!: string;
  @Input() description!: string | null;
  @Input() routerUrl!: string;
  @Input() uri!: string;

  isMediaPause$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore, private playerApi: PlayerApiService) {}

  ngOnInit() {
    this.isMediaPause$ = SelectorUtil.getMediaPauseState(
      combineLatest([of(this.uri), this.playbackStore.playback$])
    );
  }

  togglePlaylist(isPause: boolean) {
    const playbackObs$ = isPause
      ? this.playerApi.play({
          context_uri: this.uri
        })
      : this.playerApi.pause();

    playbackObs$.subscribe();
  }
}
