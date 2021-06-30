import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
@Component({
  selector: 'as-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaComponent implements OnInit {
  @Input() imageUrl: string | undefined;
  @Input() title!: string;
  @Input() description!: string | null;
  @Input() routerUrl!: string;
  @Input() uri!: string;
  @Input() roundedImage? = false;
  @Output() togglePlay = new EventEmitter<boolean>();

  isMediaPlaying$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore) {}

  ngOnInit() {
    this.isMediaPlaying$ = SelectorUtil.getMediaPlayingState(
      combineLatest([of(this.uri), this.playbackStore.playback$])
    );
  }
}
